'use client';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, UploadCloud, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

export default function JournalManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    hashnodeLink: '',
    description: '',
    thumbnail: '',
  });
  const [uploadingImg, setUploadingImg] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/journal');
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Image Upload
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
        setForm({ ...form, thumbnail: data.url });
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setUploadingImg(false);
    }
  };

  // 3. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.thumbnail) return alert("Please upload a thumbnail");
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (res.ok) {
        setForm({ title: '', hashnodeLink: '', description: '', thumbnail: '' });
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
    if (!confirm('Delete this journal entry?')) return;
    try {
      await fetch(`/api/journal?id=${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item._id !== id));
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <span className="text-gold">Journal</span> Manager
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === LEFT: CREATE FORM === */}
        <div className="lg:col-span-1 bg-navy-light border border-taupe/20 p-6 rounded-xl h-fit sticky top-6">
          <h2 className="text-lg font-bold mb-6 text-white uppercase tracking-widest">Write New Entry</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full bg-navy border border-taupe rounded p-2 text-white focus:border-gold outline-none"
                placeholder="The Philosophy of NPR Rendering"
                required 
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Short Description</label>
              <textarea 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full bg-navy border border-taupe rounded p-2 text-white focus:border-gold outline-none h-24 resize-none"
                placeholder="A brief summary for the card..."
                required 
              />
            </div>

            {/* Hashnode Link */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Hashnode URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-2 top-2.5 text-slate" size={14} />
                <input 
                  type="url" 
                  value={form.hashnodeLink}
                  onChange={(e) => setForm({...form, hashnodeLink: e.target.value})}
                  className="w-full bg-navy border border-taupe rounded py-2 pl-8 pr-2 text-white focus:border-gold outline-none"
                  placeholder="https://mrigtrishna.hashnode.dev/..."
                  required 
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Thumbnail</label>
              <div className="relative border-2 border-dashed border-taupe rounded-lg p-6 hover:bg-white/5 transition-colors text-center cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {uploadingImg ? (
                  <Loader2 className="animate-spin mx-auto text-gold" />
                ) : form.thumbnail ? (
                  <div className="relative h-32 w-full">
                    <Image src={form.thumbnail} alt="Preview" fill className="object-cover rounded" />
                  </div>
                ) : (
                  <div className="text-slate">
                    <UploadCloud className="mx-auto mb-2" />
                    <span className="text-xs">Upload Thumbnail</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting || uploadingImg || !form.thumbnail}
              className="w-full bg-gold hover:bg-gold-hover text-navy font-bold py-3 rounded uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Add to Journal"}
            </button>
          </form>
        </div>

        {/* === RIGHT: LIST OF ENTRIES === */}
        <div className="lg:col-span-2 space-y-4">
           <h2 className="text-lg font-bold mb-4 text-white uppercase tracking-widest">Published Stories ({items.length})</h2>
           
           {loading ? (
             <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-gold" /></div>
           ) : items.length === 0 ? (
             <div className="text-slate text-center py-10 border border-dashed border-taupe rounded">No stories yet.</div>
           ) : (
             items.map((item) => (
               <div key={item._id} className="flex gap-4 bg-navy-light border border-taupe/20 p-4 rounded-xl items-start group">
                 
                 <div className="h-24 w-24 relative bg-navy rounded overflow-hidden shrink-0">
                   <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                 </div>

                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-white text-lg leading-tight">{item.title}</h3>
                   <p className="text-slate text-sm mt-1 line-clamp-2">{item.description}</p>
                   <a href={item.hashnodeLink} target="_blank" className="text-gold text-xs uppercase tracking-wider mt-2 inline-block hover:underline">
                     Read on Hashnode →
                   </a>
                 </div>

                 <button 
                   onClick={() => handleDelete(item._id)}
                   className="p-2 text-slate hover:text-red-500 transition-colors"
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