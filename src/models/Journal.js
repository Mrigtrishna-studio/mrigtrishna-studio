import mongoose from 'mongoose';

const JournalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  thumbnail: { type: String, required: true }, // Cloudflare R2 URL
  description: { type: String, required: true },
  hashnodeLink: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Journal || mongoose.model('Journal', JournalSchema);
