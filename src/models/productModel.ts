import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
    name: String,
    price: Number,
    discount: Number,
    description: String,
    category: String,
    collection: [String], //clothing styles like: casual, formal, gym wear etc
    rating: Number,
    size: [String],
    color: [String],
    brand: String,
    images: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }    
});

export default mongoose.model('Product', productSchema);
