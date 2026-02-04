import mongoose from 'mongoose';

const AdminCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.models.AdminCode || mongoose.model('AdminCode', AdminCodeSchema);
