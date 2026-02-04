'use client';
import { useState, useEffect, useCallback } from 'react';
import { Loader2, Trash2, UploadCloud, ShoppingBag, Plus, DollarSign, Check } from 'lucide-react';
import Image from 'next/image';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

export default function ShopManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State (Renamed 'thumbnail' -> 'image')
  const [form, setForm] = useState({
    title: '',
    category: 'Environment',
    price: '',
    gumroadLink: '',
    image: '', // <--- FIX: Matches your Database Model now
  });

  // --- CROPPER STATE ---
  const [uploadingImg, setUploadingImg] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // 1. Fetch Products
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/shop', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. IMAGE SELECTED -> OPEN CROPPER
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result);
        setIsCropModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // 3. UPLOAD CROPPED IMAGE (4:5 Ratio)
  const handleCropAndUpload = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;
    
    setUploadingImg(true);
    try {
      // Crop locally
      const blob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const file = new File([blob], "shop_product.jpg", { type: "image/jpeg" });
      
      // Upload to API
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success) {
        setForm({ ...form, image: data.url }); // <--- FIX: Save as 'image'
        setIsCropModalOpen(false); 
        setCropImageSrc(null);     
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setUploadingImg(false);
    }
  };

  // 4. SUBMIT PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return alert("Please upload a product image"); // <--- FIX
    if (!form.price) return alert("Please enter a price");
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form), // Now sends 'image' correctly!
      });
      
      const data = await res.json();

      if (data.success) {
        // Reset Form
        setForm({ title: '', category: 'Environment', price: '', gumroadLink: '', image: '' });
        fetchItems(); 
      } else {
        alert('Failed to save product: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Delete Product
  const handleDelete = async (id) => {
    if (!confirm('Remove this product from the store?')) return;
    try {
      await fetch(`/api/shop?id=${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item._id !== id));
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 relative">
      
      {/* === CROPPER MODAL (4:5) === */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-lg h-125 relative bg-navy border border-taupe rounded-xl overflow-hidden mb-6">
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 5} 
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full max-w-xs mb-6">
             <span className="text-xs text-slate font-bold uppercase">Zoom</span>
             <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-full accent-gold" />
          </div>

          <div className="flex gap-4">
            <button onClick={() => setIsCropModalOpen(false)} className="px-6 py-3 rounded-full border border-red-500 text-red-500 font-bold uppercase hover:bg-red-500 hover:text-white transition">Cancel</button>
            <button onClick={handleCropAndUpload} disabled={uploadingImg} className="px-8 py-3 rounded-full bg-gold text-navy font-bold uppercase hover:bg-white transition flex items-center gap-2">
              {uploadingImg ? <Loader2 className="animate-spin" /> : <><Check size={20} /> Crop & Upload</>}
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <span className="text-gold">Shop</span> Manager
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === LEFT: CREATE FORM === */}
        <div className="lg:col-span-1 bg-navy-light border border-taupe/20 p-6 rounded-xl h-fit sticky top-6">
          <h2 className="text-lg font-bold mb-6 text-white uppercase tracking-widest">Add Product</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Product Name</label>
              <input 
                type="text" 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full bg-navy border border-taupe rounded p-2 text-white focus:border-gold outline-none"
                placeholder="Anime Sky Shader Pack"
                required 
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Price</label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 text-slate" size={14} />
                <input 
                  type="text" 
                  value={form.price}
                  onChange={(e) => setForm({...form, price: e.target.value})}
                  className="w-full bg-navy border border-taupe rounded py-2 pl-8 pr-2 text-white focus:border-gold outline-none"
                  placeholder="25"
                  required 
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Type</label>
              <select 
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full bg-navy border border-taupe rounded p-2 text-white focus:border-gold outline-none"
              >
                <option value="Environment">Environment</option>
                <option value="Prop">Prop</option>
                <option value="Texture">Texture</option>
                <option value="Addon">Addon</option>
                <option value="Shader">Shader</option>
                <option value="3D Model">3D Model</option>
              </select>
            </div>

            {/* Gumroad Link */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Gumroad Link</label>
              <div className="relative">
                <ShoppingBag className="absolute left-2 top-2.5 text-slate" size={14} />
                <input 
                  type="url" 
                  value={form.gumroadLink}
                  onChange={(e) => setForm({...form, gumroadLink: e.target.value})}
                  className="w-full bg-navy border border-taupe rounded py-2 pl-8 pr-2 text-white focus:border-gold outline-none"
                  placeholder="https://gumroad.com/l/..."
                  required 
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-light mb-1">Cover Image (4:5)</label>
              <div className="relative border-2 border-dashed border-taupe rounded-lg p-6 hover:bg-white/5 transition-colors text-center cursor-pointer overflow-hidden group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={onFileChange} // <--- Triggers Modal
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {form.image ? ( // <--- FIX: Check form.image
                  <div className="relative h-48 w-full">
                    <Image src={form.image} alt="Preview" fill className="object-cover rounded" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-gold font-bold text-xs uppercase flex gap-1"><UploadCloud size={14}/> Change</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate">
                    <UploadCloud className="mx-auto mb-2" />
                    <span className="text-xs">Click to Upload</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting || uploadingImg || !form.image} // <--- FIX
              className="w-full bg-gold hover:bg-gold-hover text-navy font-bold py-3 rounded uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add to Store"}
            </button>
          </form>
        </div>

        {/* === RIGHT: LIST OF PRODUCTS === */}
        <div className="lg:col-span-2 space-y-4">
           <h2 className="text-lg font-bold mb-4 text-white uppercase tracking-widest">Active Products ({items.length})</h2>
           
           {loading ? (
             <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-gold" /></div>
           ) : items.length === 0 ? (
             <div className="text-slate text-center py-10 border border-dashed border-taupe rounded">No products yet.</div>
           ) : (
             items.map((item) => (
               <div key={item._id} className="flex gap-4 bg-navy-light border border-taupe/20 p-4 rounded-xl items-center group">
                 
                 {/* Image */}
                 <div className="h-20 w-16 relative bg-navy rounded overflow-hidden shrink-0 border border-taupe/10">
                   {item.image ? ( // <--- FIX: Use item.image
                     <Image 
                        src={item.image} 
                        alt={item.title || "Product Image"} 
                        fill 
                        className="object-cover" 
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-navy text-slate-500 text-[10px] uppercase font-bold">
                       No Img
                     </div>
                   )}
                 </div>

                 {/* Info */}
                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-white truncate">{item.title}</h3>
                   <div className="flex items-center gap-3 mt-1">
                     <span className="px-2 py-0.5 bg-navy border border-taupe text-[10px] uppercase text-gold rounded">
                       {item.category}
                     </span>
                     <span className="text-xs text-white font-bold flex items-center">
                       <DollarSign size={10} /> {item.price}
                     </span>
                     <a href={item.gumroadLink} target="_blank" className="text-xs text-slate hover:text-white truncate max-w-37.5">
                       {item.gumroadLink}
                     </a>
                   </div>
                 </div>

                 {/* Delete */}
                 <button 
                   onClick={() => handleDelete(item._id)}
                   className="p-3 text-slate hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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