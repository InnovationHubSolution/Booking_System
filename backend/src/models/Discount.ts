import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscount extends Document {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    description: string;
    validFrom: Date;
    validUntil: Date;
    maxUses?: number;
    usedCount: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    applicableCategories?: string[];
    userRestrictions?: {
        newUsersOnly?: boolean;
        specificUsers?: string[];
        maxUsesPerUser?: number;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Instance methods
    isValid(): boolean;
    canUserUse(userId: string): Promise<boolean>;
    calculateDiscount(amount: number): number;
}

const DiscountSchema = new Schema<IDiscount>({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    validFrom: {
        type: Date,
        required: true,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    maxUses: {
        type: Number,
        min: 1
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    minPurchaseAmount: {
        type: Number,
        min: 0
    },
    maxDiscountAmount: {
        type: Number,
        min: 0
    },
    applicableCategories: [{
        type: String,
        enum: ['accommodation', 'car-rental', 'tour', 'transfer', 'activity', 'all']
    }],
    userRestrictions: {
        newUsersOnly: {
            type: Boolean,
            default: false
        },
        specificUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        maxUsesPerUser: {
            type: Number,
            min: 1
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
// code index automatically created by unique: true
DiscountSchema.index({ isActive: 1 });
DiscountSchema.index({ validFrom: 1, validUntil: 1 });

// Method to check if discount is valid
DiscountSchema.methods.isValid = function (): boolean {
    const now = new Date();
    return this.isActive &&
        this.validFrom <= now &&
        this.validUntil >= now &&
        (!this.maxUses || this.usedCount < this.maxUses);
};

// Method to check if user can use discount
DiscountSchema.methods.canUserUse = async function (userId: string): Promise<boolean> {
    if (!this.isValid()) return false;

    if (this.userRestrictions) {
        // Check if discount is for new users only
        if (this.userRestrictions.newUsersOnly) {
            const User = mongoose.model('User');
            const user = await User.findById(userId);
            if (!user || user.bookings?.length > 0) {
                return false;
            }
        }

        // Check if discount is for specific users
        if (this.userRestrictions.specificUsers?.length > 0) {
            if (!this.userRestrictions.specificUsers.includes(userId)) {
                return false;
            }
        }

        // Check max uses per user
        if (this.userRestrictions.maxUsesPerUser) {
            const DiscountUsage = mongoose.model('DiscountUsage');
            const userUsageCount = await DiscountUsage.countDocuments({
                discountId: this._id,
                userId
            });
            if (userUsageCount >= this.userRestrictions.maxUsesPerUser) {
                return false;
            }
        }
    }

    return true;
};

// Method to calculate discount amount
DiscountSchema.methods.calculateDiscount = function (amount: number): number {
    let discount = 0;

    if (this.type === 'percentage') {
        discount = (amount * this.value) / 100;
    } else {
        discount = this.value;
    }

    // Apply maximum discount limit if set
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
        discount = this.maxDiscountAmount;
    }

    return Math.min(discount, amount); // Discount cannot exceed total amount
};

const Discount = mongoose.model<IDiscount>('Discount', DiscountSchema);

export default Discount;
