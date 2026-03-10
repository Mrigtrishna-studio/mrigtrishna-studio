'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Type, Highlighter, Bold, Code } from 'lucide-react';

export default function NewPostEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [seriesList, setSeriesList] = useState([]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [seriesId, setSeriesId] = useState('');

  const [sections, setSections] = useState([]);

  useEffect(() => {
    async function fetchSeries() {
      const res = await fetch('/api/journal');
      const data = await res.json();
      if (data.success) setSeriesList(data.data);
    }
    fetchSeries();
  }, []);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleImageUpload = async (e, sectionId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const compressedImage = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressedImage);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        if (sectionId === 'cover') {
          setCoverImage(data.url);
        } else {
          updateSection(sectionId, 'imageUrl', data.url);
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/webp' })), 'image/webp', 0.8);
        };
      };
    });
  };

  const addSection = (type) => {
    const newSection = {
      id: Date.now().toString(),
      type: type,
      content: '',
      imageUrl: '',
      caption: ''
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(sec => sec.id === id ? { ...sec, [field]: value } : sec));
  };

  const removeSection = (id) => {
    setSections(sections.filter(sec => sec.id !== id));
  };

  const moveSection = (index, direction) => {
    if (index + direction < 0 || index + direction >= sections.length) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + direction];
    newSections[index + direction] = temp;
    setSections(newSections);
  };

  const applyFormatting = (sectionId, tagOpen, tagClose) => {
    const textarea = document.getElementById(`textarea-${sectionId}`);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = textarea.value.substring(0, start) + tagOpen + selectedText + tagClose + textarea.value.substring(end);

    updateSection(sectionId, 'content', newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("Please enter a Post Title before publishing.");
    if (!seriesId) return alert("Please select a Series for this devlog.");

    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, excerpt, coverImage, seriesId, sections })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/posts');
      } else {
        alert("Failed to save post: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a1120] text-white p-8 font-sans selection:bg-gold selection:text-navy">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-gold">Compose Devlog</h1>
          <button onClick={handleSubmit} disabled={loading} className="bg-gold text-navy px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all">
            {loading ? <Loader2 className="animate-spin" /> : 'Publish Log'}
          </button>
        </div>

        {/* --- POST METADATA --- */}
        <div className="bg-[#162033]/50 p-8 rounded-2xl border border-white/5 mb-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase text-slate mb-2 font-bold">Series Connection</label>
              <select value={seriesId} onChange={(e) => setSeriesId(e.target.value)} className="w-full bg-[#0a1120] border border-white/10 rounded-lg p-4 text-white focus:border-gold outline-none">
                <option value="">-- Select Project Series --</option>
                {seriesList.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-slate mb-2 font-bold">Post Title</label>
              <input type="text" value={title} onChange={handleTitleChange} className="w-full bg-[#0a1120] border border-white/10 rounded-lg p-4 text-white focus:border-gold outline-none" placeholder="e.g. Character Rigging in Blender" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-slate mb-2 font-bold">Excerpt / Summary</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full bg-[#0a1120] border border-white/10 rounded-lg p-4 text-white focus:border-gold outline-none h-24" placeholder="Brief summary of this devlog..." />
          </div>

          <div>
            <label className="block text-xs uppercase text-slate mb-2 font-bold">Cover Banner (16:9)</label>
            {coverImage ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 mb-4">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button onClick={() => setCoverImage('')} className="absolute top-4 right-4 bg-red-500/80 p-2 rounded-full hover:bg-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} className="block w-full text-sm text-slate file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:bg-navy-light file:text-gold hover:file:bg-white/10 transition-all cursor-pointer" />
            )}
          </div>
        </div>

        {/* --- BLOCK BUILDER --- */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-widest border-l-4 border-gold pl-4 mb-8">Article Content</h2>

          {sections.map((section, index) => (
            <div key={section.id} className="bg-[#162033]/30 p-6 rounded-2xl border border-white/5 relative group transition-all hover:border-gold/30">

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                    {section.type.replace('-', ' ')} block
                  </span>

                  {section.type === 'text' && (
                    <div className="w-full bg-[#050810] border border-white/10 rounded-xl p-6 text-gold font-mono text-sm focus:border-gold outline-none min-h-[350px] whitespace-pre resize-y leading-relaxed">
                      <button onClick={() => applyFormatting(section.id, '<b>', '</b>')} className="p-2 hover:bg-white/10 rounded text-slate hover:text-white transition-colors" title="Bold"><Bold size={16} /></button>
                      <button onClick={() => applyFormatting(section.id, '<mark style="background-color: #D4AF37; color: #0a1120; padding: 2px 6px; border-radius: 4px; font-weight: 800; box-shadow: 0 0 10px rgba(212,175,55,0.3);">', '</mark>')} className="p-2 hover:bg-gold/20 rounded text-gold transition-colors" title="Signature Highlight"><Highlighter size={16} /></button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveSection(index, -1)} className="p-2 bg-[#0a1120] border border-white/10 rounded-lg hover:text-gold hover:border-gold/50 transition-all" title="Move Up"><ArrowUp size={14} /></button>
                  <button onClick={() => moveSection(index, 1)} className="p-2 bg-[#0a1120] border border-white/10 rounded-lg hover:text-gold hover:border-gold/50 transition-all" title="Move Down"><ArrowDown size={14} /></button>
                  <button onClick={() => removeSection(section.id)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Delete Block"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-4">
                {section.type === 'text' && (
                  <textarea
                    id={`textarea-${section.id}`}
                    value={section.content}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    placeholder="Write your production log here... Highlight text and use the toolbar above to style."
                    className="w-full bg-[#0a1120] border border-white/10 rounded-xl p-6 text-white focus:border-gold outline-none min-h-[350px] resize-y leading-relaxed text-lg"
                  />
                )}

                {section.type === 'code' && (
                  <div className="relative">
                    <textarea
                      id={`textarea-${section.id}`}
                      value={section.content}
                      onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                      placeholder="// Paste your C#, Python, or JavaScript code here..."
                      spellCheck="false"
                      className="w-full bg-[#050810] border border-white/10 rounded-xl p-6 text-emerald-400 font-mono text-sm focus:border-gold outline-none min-h-[350px] whitespace-pre resize-y leading-relaxed"
                    />
                  </div>
                )}

                {section.type.includes('image') && (
                  <div className="bg-[#0a1120] border border-white/10 rounded-xl p-8 text-center min-h-[150px] flex flex-col items-center justify-center">
                    {section.imageUrl ? (
                      <div className="space-y-4 w-full">
                        <img src={section.imageUrl} alt="Section media" className="max-h-96 mx-auto rounded-lg shadow-lg" />
                        <input type="text" placeholder="Image Caption (Optional)" value={section.caption} onChange={(e) => updateSection(section.id, 'caption', e.target.value)} className="w-full max-w-md mx-auto block bg-transparent border-b border-white/20 text-sm text-center focus:border-gold outline-none py-2 text-slate" />
                      </div>
                    ) : (
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, section.id)} className="block w-full max-w-xs text-sm text-slate file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:bg-navy-light file:text-white hover:file:text-gold transition-all cursor-pointer" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* --- ADD NEW BLOCK CONTROLS --- */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <button onClick={() => addSection('text')} className="flex flex-col items-center justify-center gap-2 py-4 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate hover:text-gold hover:border-gold/50 hover:bg-gold/5 transition-all">
            <Type size={18} /> Text
          </button>
          <button onClick={() => addSection('code')} className="flex flex-col items-center justify-center gap-2 py-4 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
            <Code size={18} /> Code
          </button>
          <button onClick={() => addSection('image-full')} className="flex flex-col items-center justify-center gap-2 py-4 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate hover:text-gold hover:border-gold/50 hover:bg-gold/5 transition-all">
            <ImageIcon size={18} /> Full Image
          </button>
          <button onClick={() => addSection('image-left')} className="flex flex-col items-center justify-center gap-2 py-4 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate hover:text-gold hover:border-gold/50 hover:bg-gold/5 transition-all">
            <ImageIcon size={18} /> Image Left
          </button>
          <button onClick={() => addSection('image-right')} className="flex flex-col items-center justify-center gap-2 py-4 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate hover:text-gold hover:border-gold/50 hover:bg-gold/5 transition-all">
            <ImageIcon size={18} /> Image Right
          </button>
        </div>

      </div>
    </main>
  );
}