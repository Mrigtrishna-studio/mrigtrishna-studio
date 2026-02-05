'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Mail, Send, Loader2, CheckCircle, 
  Github, Youtube, Instagram, Twitter, Linkedin, 
  ShoppingBag, BookOpen 
} from 'lucide-react';

// === CUSTOM ARTSTATION ICON (Official Logo) ===
const ArtStationIcon = ({ size = 24, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12.016 4.72L24 22H20.06L12.016 8.78L4.35 22H0L12.016 4.72ZM10.426 15.34L12.016 12.78L13.626 15.34H10.426ZM12.016 10.6L16.296 17.5H7.736L12.016 10.6Z" />
  </svg>
);

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Settings State
  const [contactEmail, setContactEmail] = useState('contact@mrigtrishna.com');
  const [socials, setSocials] = useState({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', category: 'General Inquiry', message: ''
  });

  // 1. Fetch Dynamic Settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.contactEmail) setContactEmail(data.data.contactEmail);
          if (data.data.socials) setSocials(data.data.socials);
        }
      } catch (e) { console.error(e); }
      setSettingsLoaded(true);
    }
    fetchSettings();
  }, []);

  // UI Configuration for Socials (Icon + Color)
  const socialConfig = {
    // Uses the Custom Icon now
    artstation: { icon: <ArtStationIcon />, color: 'hover:text-[#13AFF0]', label: 'ArtStation' },
    github:     { icon: <Github />, color: 'hover:text-white', label: 'GitHub' },
    youtube:    { icon: <Youtube />, color: 'hover:text-[#FF0000]', label: 'YouTube' },
    linkedin:   { icon: <Linkedin />, color: 'hover:text-[#0A66C2]', label: 'LinkedIn' },
    twitter:    { icon: <Twitter />, color: 'hover:text-white', label: 'X (Twitter)' },
    instagram:  { icon: <Instagram />, color: 'hover:text-[#E1306C]', label: 'Instagram' },
    hashnode:   { icon: <BookOpen />, color: 'hover:text-[#2962FF]', label: 'Hashnode' },
    gumroad:    { icon: <ShoppingBag />, color: 'hover:text-[#FF90E8]', label: 'Gumroad' },
  };

  const categories = ["General Inquiry", "Freelance Project", "Collaboration", "Bug Report", "Other"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', category: 'General Inquiry', message: '' });
      } else alert("Failed to send.");
    } catch (error) { alert("Error sending message."); }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-navy text-white selection:bg-gold selection:text-navy flex flex-col">
      <Navbar />

      <div className="flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* CSS FIX: gap-12 on mobile, gap-16 on desktop to prevent squashing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* === LEFT: Socials & Info === */}
          <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-6">Let's <span className="text-gold">Connect</span></h1>
              <p className="text-slate text-lg leading-relaxed">Whether you have a game dev question or a freelance proposal, I'm always open to a conversation.</p>
            </div>

            {/* DYNAMIC SOCIAL GRID */}
            <div>
              <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-6">Social Presence</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {settingsLoaded && Object.keys(socialConfig).map((key) => {
                  const config = socialConfig[key]; // Icon & Color
                  const data = socials[key]; // URL & Visibility from DB
                  
                  // Only render if data exists AND 'show' is true
                  if (!data || !data.show || !data.url) return null;

                  return (
                    <a 
                      key={key} 
                      href={data.url} 
                      target="_blank" 
                      className={`flex flex-col items-center justify-center p-6 bg-navy-light border border-taupe/20 rounded-xl transition-all duration-300 group hover:border-gold/30 hover:-translate-y-1 ${config.color}`}
                    >
                      <div className="mb-3 text-slate group-hover:text-inherit transition-colors">
                        {config.icon}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate group-hover:text-white">
                        {config.label}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC EMAIL DISPLAY */}
            <div className="bg-navy-light/50 p-6 rounded-xl border border-taupe/10 flex items-center gap-4 break-all">
              <div className="bg-gold/10 p-3 rounded-full text-gold flex-shrink-0"><Mail size={24} /></div>
              <div>
                <p className="text-xs text-slate uppercase tracking-widest">Email Directly</p>
                <a href={`mailto:${contactEmail}`} className="text-lg md:text-xl font-bold hover:text-gold transition-colors break-all">
                  {contactEmail}
                </a>
              </div>
            </div>
          </div>

          {/* === RIGHT: Form === */}
          <div className="bg-navy-light border border-taupe/20 p-8 md:p-10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <CheckCircle className="text-gold w-20 h-20 mb-6 animate-bounce" />
                <h2 className="text-3xl font-bold text-white mb-2">Message Sent!</h2>
                <p className="text-slate mb-8">Thank you for reaching out. I'll get back to you shortly.</p>
                <button onClick={() => setSuccess(false)} className="text-gold font-bold uppercase tracking-widest hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold mb-8">Send a Message</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gold uppercase tracking-widest">Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-navy border border-taupe/30 rounded-lg p-4 text-white focus:border-gold outline-none" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gold uppercase tracking-widest">Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-navy border border-taupe/30 rounded-lg p-4 text-white focus:border-gold outline-none" placeholder="john@example.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gold uppercase tracking-widest">Topic</label>
                   <div className="relative">
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-navy border border-taupe/30 rounded-lg p-4 text-white focus:border-gold outline-none appearance-none cursor-pointer">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                   </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gold uppercase tracking-widest">Message</label>
                  <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-navy border border-taupe/30 rounded-lg p-4 text-white focus:border-gold outline-none" placeholder="How can I help you?" />
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-gold text-navy font-bold text-lg uppercase tracking-widest py-4 rounded-lg hover:bg-white transition flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Send Message</>}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}