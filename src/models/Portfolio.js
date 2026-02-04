import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true }, // Cloudflare R2 URL
  artstationLink: { type: String, required: true },
  category: { 
    type: String, 
    default: 'General' // You can filter by this later if needed
  },
  createdAt: { type: Date, default: Date.now }
});

// Prevents "OverwriteModelError" in Next.js hot reloading
export default mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema);