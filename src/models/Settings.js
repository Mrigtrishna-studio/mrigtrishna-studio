import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  // --- Existing Homepage Fields ---
  heroText: { type: String, default: 'Mrigtrishna' },
  heroVideo: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  profileDescription: { type: String, default: '' },
  contactEmail: { type: String, default: 'contact@mrigtrishna.com' },

  // --- ABOUT PAGE FIELDS (Updated) ---
  aboutPageTitle: { type: String, default: 'The Studio' }, // <--- NEW (Top Header)
  aboutPageSubtitle: { type: String, default: 'Mrigtrishna is a specialized production lab focused on high-fidelity environment art and technical optimization.' }, // <--- NEW (Subtitle)
  
  aboutHeading: { type: String, default: 'I am Niraj Kumar.' }, 
  aboutBody: { type: String, default: '...' },

  // --- Existing Socials ---
  socials: {
    artstation: { url: { type: String, default: '' }, show: { type: Boolean, default: true } },
    github:     { url: { type: String, default: '' }, show: { type: Boolean, default: true } },
    youtube:    { url: { type: String, default: '' }, show: { type: Boolean, default: true } },
    linkedin:   { url: { type: String, default: '' }, show: { type: Boolean, default: true } },
    twitter:    { url: { type: String, default: '' }, show: { type: Boolean, default: true } },
    instagram:  { url: { type: String, default: '' }, show: { type: Boolean, default: true } },
    hashnode:   { url: { type: String, default: '' }, show: { type: Boolean, default: true } },
    gumroad:    { url: { type: String, default: '' }, show: { type: Boolean, default: true } },
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);