import mongoose from 'mongoose';

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true }, // Markdown or HTML content
  coverImage: { type: String }, // Your Cloudflare URL
  category: { type: String, default: 'Technical' },
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series' }, // Connects it to a Series
  status: { type: String, enum: ['draft', 'published'], default: 'published' }
}, { timestamps: true });

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);