import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
    userId: mongoose.Types.ObjectId;
    properties: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const WishlistSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
