'use client';
import { useState, useEffect } from 'react';
import { FolderPlus, Loader2, BookOpen, ImagePlus, X, Trash2 } from 'lucide-react';

export default function AdminJournal() {
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file)); 
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/webp', 0.8);
        };
      };
    });
  };

  const fetchSeries = async () => {
    try {
      const res = await fetch('/api/journal/series');
      const data = await res.json();
      if (data.success) setSeriesList(data.data);
    } catch (error) {
      console.error("Failed to load series");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this series?")) return;
    try {
      const res = await fetch(`/api/journal/series?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchSeries(); 
      else alert(data.message);
    } catch (error) {
      alert("Failed to delete.");
    }
  };

  // 🚨 THE X-RAY LOGS ARE HERE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    console.log("👉 1. Submit clicked. Cover file exists?", !!coverFile);

    try {
      let finalImageUrl = "";

      if (coverFile) {
        console.log("👉 2. Compressing image...");
        const compressedFile = await compressImage(coverFile);
        console.log("👉 3. Compression done. File size (KB):", (compressedFile.size / 1024).toFixed(2));
        
        const formData = new FormData();
        formData.append('file', compressedFile);

        console.log("👉 4. Sending to Cloudflare via /api/upload...");
        const uploadRes = await fetch('/api/upload', { 
          method: 'POST',
          body: formData,
        });
        
        console.log("👉 5. Upload API HTTP Status:", uploadRes.status);
        const uploadData = await uploadRes.json();
        console.log("👉 6. Upload API Response:", uploadData);

        if (uploadData.success) {
          finalImageUrl = uploadData.url; 
          console.log("✅ 7. Cloudflare SUCCESS. URL:", finalImageUrl);
        } else {
          console.error("❌ CLOUDFLARE REJECTED:", uploadData);
          alert(`Upload failed: ${uploadData.error || uploadData.message}`);
          setSubmitting(false);
          return;
        }
      }

      console.log("👉 8. Saving to MongoDB...");
      const res = await fetch('/api/journal/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, description, coverImage: finalImageUrl, status: 'published' }),
      });

      const data = await res.json();
      console.log("👉 9. MongoDB Response:", data);

      if (data.success) {
        setTitle(''); setSlug(''); setDescription(''); setCoverFile(null); setCoverPreview(null);
        fetchSeries(); 
        console.log("✅ 10. ALL DONE!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ CRITICAL ERROR:", error);
      alert("Something went wrong. Check console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="text-gold" /> Journal & Devlogs
        </h1>
        <p className="text-slate text-sm mt-2">Manage your production diaries and series cards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-navy-light border border-taupe/30 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FolderPlus size={18} className="text-gold" /> Create New Series
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-light mb-2 block">Cover Image</label>
                {coverPreview ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-taupe/30 group">
                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setCoverPreview(null); setCoverFile(null); }} className="absolute top-2 right-2 bg-navy/80 hover:bg-red-500/80 text-white p-1.5 rounded-full transition-colors"><X size={14} /></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-taupe/40 rounded-lg cursor-pointer hover:bg-white/5 hover:border-gold/50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImagePlus size={24} className="text-slate mb-2" />
                      <p className="text-xs text-slate text-center px-4">Click to upload cover <br/>(Auto-compresses to WebP)</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-light mb-1 block">Series Title</label>
                <input type="text" value={title} onChange={handleTitleChange} placeholder="e.g. Fated Roads: Chapter 1" className="w-full bg-navy border border-taupe rounded-lg py-2 px-3 text-white focus:outline-none focus:border-gold transition-colors text-sm" required />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-light mb-1 block">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief summary of what this devlog covers..." rows={4} className="w-full bg-navy border border-taupe rounded-lg py-2 px-3 text-white focus:outline-none focus:border-gold transition-colors text-sm resize-none" required />
              </div>
              <button type="submit" disabled={submitting || (!title || !description)} className="w-full bg-gold hover:bg-gold-hover text-navy font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : "Create Series"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-navy-light border border-taupe/30 rounded-2xl p-6 shadow-xl min-h-[400px]">
            <h2 className="text-lg font-bold text-white mb-6">Active Series</h2>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-slate"><Loader2 className="animate-spin" size={24} /></div>
            ) : seriesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate border border-dashed border-taupe/30 rounded-lg">
                <BookOpen size={24} className="mb-2 opacity-50" /><p className="text-sm">No series created yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seriesList.map((series) => (
                  <div key={series._id} className="group border border-taupe/30 hover:border-gold/50 rounded-xl overflow-hidden transition-all duration-300 bg-navy/50 hover:bg-navy flex flex-col">
                    {series.coverImage ? (
                      <div className="h-32 w-full overflow-hidden border-b border-taupe/30">
                        <img src={series.coverImage} alt={series.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-32 w-full bg-navy-light flex items-center justify-center border-b border-taupe/30"><ImagePlus size={24} className="text-slate/30" /></div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-md font-bold text-white group-hover:text-gold transition-colors">{series.title}</h3>
                      <p className="text-sm text-slate-light mt-2 line-clamp-2 flex-1">{series.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                         <div className="flex gap-2 items-center">
                           <span className="text-xs font-mono text-slate bg-white/5 px-2 py-1 rounded">/{series.slug}</span>
                           <span className="text-xs font-bold uppercase text-gold">{series.status}</span>
                         </div>
                         <button onClick={() => handleDelete(series._id)} className="text-slate hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-md transition-colors" title="Delete Series"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}