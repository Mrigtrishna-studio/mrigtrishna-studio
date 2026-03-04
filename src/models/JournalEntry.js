import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema({
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
  // The relational link to the Series model
  series: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Series', 
    required: true 
  },
  content: { 
    type: String, // This will store the HTML from your Rich Text Editor
    required: true 
  },
  coverImage: { 
    type: String, 
    required: false 
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, { timestamps: true });

export default mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema);