'use client';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, Globe, Eye, EyeOff, Mail, Type, Video, User, UploadCloud, Check, FileText } from 'lucide-react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Cropper State
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    heroText: '', heroVideo: '', profileImage: '', profileDescription: '', contactEmail: '',
    aboutPageTitle: '', aboutPageSubtitle: '', // <--- NEW
    aboutHeading: '', aboutBody: '',
    socials: {
      artstation: { url: '', show: true }, github: { url: '', show: true }, youtube: { url: '', show: true },
      linkedin: { url: '', show: true }, twitter: { url: '', show: true }, instagram: { url: '', show: true },
      hashnode: { url: '', show: true }, gumroad: { url: '', show: true },
    }
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.data) {
          setSettings(prev => ({ ...prev, ...data.data, socials: { ...prev.socials, ...data.data.socials } }));
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchSettings();
  }, []);

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setCropImageSrc(reader.result); setIsCropModalOpen(true); });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => { setCroppedAreaPixels(croppedAreaPixels); }, []);

  const handleCropAndUpload = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "profile_cropped.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append('file', croppedFile);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, profileImage: data.url }));
        setIsCropModalOpen(false); setCropImageSrc(null);
      } else { alert("Upload failed."); }
    } catch (e) { console.error(e); alert("Error."); } finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Settings Saved!');
    } catch (e) { alert('Failed to save.'); }
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-gold" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      
      {/* Cropper Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-2xl h-[500px] relative bg-navy border border-taupe rounded-xl overflow-hidden mb-6">
            <Cropper image={cropImageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsCropModalOpen(false)} className="px-6 py-3 rounded-full border border-red-500 text-red-500 font-bold uppercase">Cancel</button>
            <button onClick={handleCropAndUpload} disabled={uploading} className="px-8 py-3 rounded-full bg-gold text-navy font-bold uppercase flex items-center gap-2">{uploading ? <Loader2 className="animate-spin" /> : <><Check size={20} /> Crop & Upload</>}</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Site <span className="text-gold">Settings</span></h1>
        <button onClick={handleSave} disabled={saving} className="bg-gold text-navy px-6 py-2 rounded font-bold uppercase hover:bg-white transition flex items-center gap-2">{saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes</button>
      </div>

      {/* Hero Section */}
      <div className="bg-navy-light border border-taupe/20 p-8 rounded-xl mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Type size={20} className="text-gold" /> Homepage & General</h2>
        <div className="grid gap-6">
           <div><label className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">Hero Text</label><input type="text" value={settings.heroText} onChange={e => setSettings({...settings, heroText: e.target.value})} className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none" /></div>
           <div><label className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">Hero Video</label><input type="text" value={settings.heroVideo} onChange={e => setSettings({...settings, heroVideo: e.target.value})} className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none" /></div>
           <div><label className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">Contact Email</label><input type="text" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none" /></div>
        </div>
      </div>

      {/* Profile Image */}
      <div className="bg-navy-light border border-taupe/20 p-8 rounded-xl mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User size={20} className="text-gold" /> Global Profile Image</h2>
        <div className="border-2 border-dashed border-taupe rounded-lg flex flex-col items-center justify-center relative h-48 bg-navy overflow-hidden max-w-sm">
            <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            {settings.profileImage ? (
              <div className="relative w-full h-full"><Image src={settings.profileImage} alt="Profile Preview" fill className="object-contain" /></div>
            ) : (
              <div className="text-center text-slate"><UploadCloud className="mx-auto mb-2 text-gold" /><span className="text-xs font-bold uppercase tracking-widest">Click to Upload</span></div>
            )}
        </div>
      </div>

      {/* Homepage Description */}
      <div className="bg-navy-light border border-taupe/20 p-8 rounded-xl mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Homepage Description</h2>
        <textarea value={settings.profileDescription} onChange={e => setSettings({...settings, profileDescription: e.target.value})} className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none h-32 resize-none" />
      </div>

      {/* === ABOUT PAGE CONTENT (UPDATED) === */}
      <div className="bg-navy-light border border-taupe/20 p-8 rounded-xl mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FileText size={20} className="text-gold" /> About Page Content</h2>
        <div className="grid gap-6">
           
           {/* NEW FIELDS */}
           <div>
            <label className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">Page Title (Top Header)</label>
            <input type="text" placeholder="THE STUDIO" value={settings.aboutPageTitle} onChange={e => setSettings({...settings, aboutPageTitle: e.target.value})} className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none font-bold text-xl" />
           </div>
           <div>
            <label className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">Page Subtitle</label>
            <textarea value={settings.aboutPageSubtitle} onChange={e => setSettings({...settings, aboutPageSubtitle: e.target.value})} className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none h-20 resize-none" />
           </div>

           <div className="h-px bg-taupe/20 my-4"></div>

           {/* EXISTING FIELDS */}
           <div>
            <label className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">Bio Heading</label>
            <input type="text" placeholder="I am Niraj Kumar..." value={settings.aboutHeading} onChange={e => setSettings({...settings, aboutHeading: e.target.value})} className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none font-bold" />
           </div>
           <div>
            <label className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">Bio Body Text</label>
            <textarea value={settings.aboutBody} onChange={e => setSettings({...settings, aboutBody: e.target.value})} className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none h-64 resize-none leading-relaxed" />
           </div>
        </div>
      </div>

      {/* Socials */}
      <div className="bg-navy-light border border-taupe/20 p-8 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Globe size={20} className="text-gold" /> Social Links</h2>
        <div className="grid grid-cols-1 gap-4">
          {Object.keys(settings.socials).map((platform) => (
            <div key={platform} className="flex items-center gap-4 bg-navy p-3 rounded border border-taupe/10">
              <div className="w-32 text-sm font-bold uppercase text-slate">{platform}</div>
              <input type="text" value={settings.socials[platform].url} onChange={(e) => { const newSocials = { ...settings.socials, [platform]: { ...settings.socials[platform], url: e.target.value } }; setSettings({ ...settings, socials: newSocials }); }} className="flex-grow bg-transparent text-white outline-none text-sm placeholder-slate/30" />
              <button onClick={() => { const newSocials = { ...settings.socials, [platform]: { ...settings.socials[platform], show: !settings.socials[platform].show } }; setSettings({ ...settings, socials: newSocials }); }} className={`p-2 rounded ${settings.socials[platform].show ? 'text-gold' : 'text-slate'}`}>{settings.socials[platform].show ? <Eye size={18} /> : <EyeOff size={18} />}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}