import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Core Stack"
  category: { type: String, required: true }, // e.g., "Game Engine"
  icon: { type: String, default: 'Box' }, // e.g., "Box", "Code", "Pen"
  tools: { type: [String], required: true }, // e.g., ["Blender", "Unity"]
}, { timestamps: true });

export default mongoose.models.Skill || mongoose.model('Skill', SkillSchema);