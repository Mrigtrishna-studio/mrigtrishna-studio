'use client';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, UploadCloud, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function PortfolioManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    artstationLink: '',
    category: 'Environment', // Default
    image: '', // Will store the Cloudflare URL here
  });
  const [uploadingImg, setUploadingImg] = useState(false);

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Image Upload (The "Magic" Step)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        setForm({ ...form, image: data.url }); // Save the R2 URL
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setUploadingImg(false);
    }
  };

  // 3. Submit the Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return alert("Please upload an image first");
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        // Reset form and reload list
        setForm({ title: '', artstationLink: '', category: 'Environment', image: '' });
        fetchItems(); 
      }
    } catch (error) {
      alert('Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Delete Item
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    
    try {
      await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item._id !== id)); // Remove from UI instantly
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <span className="text-gold">Portfolio</span> Manager
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === LEFT: CREATE FORM === */}
        <div className="lg:col-span-1 bg-navy-light border border-taupe/20 p-6 rounded-xl h-fit sticky top-6">
          <h2 className="text-lg font-bold mb-6 text-white uppercase tracking-widest">Add New Work</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full bg-navy border border-taupe rounded p-2 text-white focus:border-gold outline-none"
                placeholder="Cyberpunk Alleyway"
                required 
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Category</label>
              <select 
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full bg-navy border border-taupe rounded p-2 text-white focus:border-gold outline-none"
              >
                <option>Environment</option>
                <option>Prop</option>
                <option>Character</option>
                <option>Sketch</option>
              </select>
            </div>

            {/* ArtStation Link */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">ArtStation Link</label>
              <input 
                type="url" 
                value={form.artstationLink}
                onChange={(e) => setForm({...form, artstationLink: e.target.value})}
                className="w-full bg-navy border border-taupe rounded p-2 text-white focus:border-gold outline-none"
                placeholder="https://artstation.com/artwork/..."
                required 
              />
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Upload Image (Max 1080p)</label>
              <div className="relative border-2 border-dashed border-taupe rounded-lg p-6 hover:bg-white/5 transition-colors text-center cursor-pointer">
                
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {uploadingImg ? (
                  <Loader2 className="animate-spin mx-auto text-gold" />
                ) : form.image ? (
                  <div className="relative h-32 w-full">
                    <Image src={form.image} alt="Preview" fill className="object-cover rounded" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-green-400 text-[10px] px-2 rounded">Uploaded</span>
                  </div>
                ) : (
                  <div className="text-slate">
                    <UploadCloud className="mx-auto mb-2" />
                    <span className="text-xs">Click or Drag to Upload</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={submitting || uploadingImg || !form.image}
              className="w-full bg-gold hover:bg-gold-hover text-navy font-bold py-3 rounded uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Publish to Portfolio"}
            </button>
          </form>
        </div>

        {/* === RIGHT: LIST OF ITEMS === */}
        <div className="lg:col-span-2 space-y-4">
           <h2 className="text-lg font-bold mb-4 text-white uppercase tracking-widest">Existing Works ({items.length})</h2>
           
           {loading ? (
             <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-gold" /></div>
           ) : items.length === 0 ? (
             <div className="text-slate text-center py-10 border border-dashed border-taupe rounded">No items found.</div>
           ) : (
             items.map((item) => (
               <div key={item._id} className="flex gap-4 bg-navy-light border border-taupe/20 p-4 rounded-xl items-center group">
                 
                 {/* Thumbnail */}
                 <div className="h-20 w-32 relative bg-navy rounded overflow-hidden shrink-0">
                   <Image src={item.image} alt={item.title} fill className="object-cover" />
                 </div>

                 {/* Details */}
                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-white truncate">{item.title}</h3>
                   <div className="flex gap-2 text-xs text-slate uppercase tracking-wider mt-1">
                     <span>{item.category}</span>
                     <span>•</span>
                     <a href={item.artstationLink} target="_blank" className="hover:text-gold flex items-center gap-1">
                       View Link <ExternalLink size={10} />
                     </a>
                   </div>
                 </div>

                 {/* Delete Button */}
                 <button 
                   onClick={() => handleDelete(item._id)}
                   className="p-3 text-slate hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                   title="Delete"
                 >
                   <Trash2 size={18} />
                 </button>
               </div>
             ))
           )}
        </div>

      </div>
    </div>
  );
}