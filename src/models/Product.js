import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true }, // <--- Make sure this says 'image', NOT 'thumbnail'
  gumroadLink: { type: String, required: true },
}, { timestamps: true });

// Check if model exists before compiling to prevent overwrite errors
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);