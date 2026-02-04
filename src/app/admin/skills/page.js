'use client';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, Plus, Box, Code, PenTool, Terminal, Cpu, Layers } from 'lucide-react';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState(''); // e.g. "Environment Art"
  const [category, setCategory] = useState('Core Stack'); 
  const [icon, setIcon] = useState('Box');
  const [toolsInput, setToolsInput] = useState(''); // "Blender, Unity, Python"

  const icons = ['Box', 'Code', 'PenTool', 'Terminal', 'Cpu', 'Layers'];

  const fetchSkills = async () => {
    const res = await fetch('/api/skills', { cache: 'no-store' });
    const data = await res.json();
    if (data.success) setSkills(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !toolsInput) return alert("Fill all fields");

    // Convert comma string to array: "Blender, Unity" -> ["Blender", "Unity"]
    const toolsArray = toolsInput.split(',').map(t => t.trim()).filter(t => t);

    await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, icon, tools: toolsArray }),
    });

    setTitle(''); setToolsInput(''); fetchSkills();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this skill card?')) return;
    await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
    fetchSkills();
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-gold" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-white mb-8">Manage <span className="text-gold">Skills</span></h1>

      {/* === ADD SKILL FORM === */}
      <div className="bg-navy-light border border-taupe/20 p-8 rounded-xl mb-12 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Plus size={20} className="text-gold" /> Add Skill Card
        </h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input 
            type="text" placeholder="Title (e.g. Environment Art)" 
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none"
          />
          <input 
            type="text" placeholder="Category (e.g. Core Proficiencies)" 
            value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none"
          />
          
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">Tools (Comma separated)</label>
            <input 
              type="text" placeholder="Blender, Unity 6, Python, Substance Painter" 
              value={toolsInput} onChange={e => setToolsInput(e.target.value)}
              className="w-full bg-navy border border-taupe rounded p-3 text-white outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gold uppercase tracking-widest mb-2 block">Select Icon</label>
            <div className="flex gap-4">
              {icons.map(i => (
                <button 
                  key={i} type="button" onClick={() => setIcon(i)}
                  className={`p-3 rounded border ${icon === i ? 'bg-gold text-navy border-gold' : 'border-taupe text-slate hover:text-white'}`}
                >
                  {i === 'Box' && <Box size={20} />}
                  {i === 'Code' && <Code size={20} />}
                  {i === 'PenTool' && <PenTool size={20} />}
                  {i === 'Terminal' && <Terminal size={20} />}
                  {i === 'Cpu' && <Cpu size={20} />}
                  {i === 'Layers' && <Layers size={20} />}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="md:col-span-2 bg-gold text-navy font-bold py-3 rounded hover:bg-white transition">
            Add Skill
          </button>
        </form>
      </div>

      {/* === SKILL LIST === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map(s => (
          <div key={s._id} className="bg-navy p-6 rounded border border-taupe/20 flex justify-between items-start">
            <div>
              <h3 className="font-bold text-white text-lg">{s.title}</h3>
              <p className="text-gold text-xs uppercase tracking-widest mb-2">{s.category}</p>
              <div className="flex flex-wrap gap-2">
                {s.tools.map(t => (
                  <span key={t} className="text-xs bg-navy-light px-2 py-1 rounded text-slate border border-taupe/10">{t}</span>
                ))}
              </div>
            </div>
            <button onClick={() => handleDelete(s._id)} className="text-slate hover:text-red-500"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}