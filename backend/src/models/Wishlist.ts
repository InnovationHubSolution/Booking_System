import mongoose, { Schema, Document } from 'mongoose';
import { IAuditFields } from '../types/audit';
import { auditPlugin } from '../middleware/audit';

export interface IWishlist extends Document, IAuditFields {
    userId: mongoose.Types.ObjectId;
    properties: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const WishlistSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    createdAt: { type: Date, default: Date.now }
});

// Apply audit plugin
WishlistSchema.plugin(auditPlugin, {
    fieldsToTrack: ['properties']
});

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
