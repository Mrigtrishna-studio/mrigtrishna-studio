import mongoose from 'mongoose';

const SeriesSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
  },
  description: { 
    type: String,
    required: true 
  },
  // 🚨 THIS IS THE MISSING FIELD
  coverImage: { 
    type: String, 
    required: false 
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, { timestamps: true });

// Change ONLY the last line in src/models/Series.js to this:
export default mongoose.models.JournalSeries || mongoose.model('JournalSeries', SeriesSchema);