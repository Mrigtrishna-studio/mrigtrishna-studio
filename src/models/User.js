import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // This stores the temporary login code
  accessCode: {
    type: String,
  },
  // Optional: When the code expires
  accessCodeExpires: {
    type: Date,
  },
}, { timestamps: true });

// Next.js fix: Check if model exists before creating it (prevents overwrite errors)
export default mongoose.models.User || mongoose.model('User', UserSchema);