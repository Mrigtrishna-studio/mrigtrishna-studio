import mongoose from 'mongoose';

const GlobalSettingsSchema = new mongoose.Schema({
  heroText: { type: String, default: 'MRIGTRISHNA' },
  heroVideo: { type: String, default: '' },
  
  // New Fields for "Who Am I"
  profileImage: { type: String, default: '' }, // R2 URL
  profileDescription: { type: String, default: '' },
}, { timestamps: true });

// Prevent recompilation error
export default mongoose.models.GlobalSettings || mongoose.model('GlobalSettings', GlobalSettingsSchema);