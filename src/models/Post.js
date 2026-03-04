import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    // The 'code' enum is here
    enum: ['text', 'image-full', 'image-left', 'image-right', 'quote', 'code'], 
    default: 'text' 
  },
  content: { type: String }, 
  imageUrl: { type: String }, 
  imageAlt: { type: String },
  caption: { type: String }
});

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  coverImage: { type: String },
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
  sections: [SectionSchema], 
  status: { type: String, enum: ['draft', 'published'], default: 'published' }
}, { timestamps: true });

// --- 🚨 NEXT.JS CACHE BUSTER 🚨 ---
// If Next.js has cached the old version of the model, delete it!
if (mongoose.models.Post) {
  delete mongoose.models.Post;
}

// Now compile the fresh model with the 'code' block included
export default mongoose.model('Post', PostSchema);