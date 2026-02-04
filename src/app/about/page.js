'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Box, Code, PenTool, Terminal, Cpu, Layers, Loader2 } from 'lucide-react';

const iconMap = {
  Box: <Box size={32} />, Code: <Code size={32} />, PenTool: <PenTool size={32} />,
  Terminal: <Terminal size={32} />, Cpu: <Cpu size={32} />, Layers: <Layers size={32} />
};

export default function AboutPage() {
  const [skills, setSkills] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const skillsRes = await fetch('/api/skills', { cache: 'no-store' });
        const skillsData = await skillsRes.json();
        if (skillsData.success) setSkills(skillsData.data);

        const settingsRes = await fetch('/api/settings', { cache: 'no-store' });
        const settingsData = await settingsRes.json();
        if (settingsData.success) setSettings(settingsData.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const renderBodyText = (text) => {
    if (!text) return null;
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return <br key={index} />;
      if (paragraph.trim().startsWith('"') && paragraph.trim().endsWith('"')) {
         return <p key={index} className="border-l-4 border-gold pl-6 italic text-slate-400 my-6">{paragraph.replace(/"/g, '')}</p>;
      }
      return <p key={index} className="mb-6">{paragraph}</p>;
    });
  };

  if (loading) return <main className="min-h-screen bg-navy flex items-center justify-center"><Loader2 className="animate-spin text-gold" size={40} /></main>;

  return (
    <main className="min-h-screen bg-navy text-white selection:bg-gold selection:text-navy flex flex-col">
      <Navbar />

      <div className="grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        
        {/* === HEADER SECTION (DYNAMIC) === */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-6">
            {settings?.aboutPageTitle || "The Studio"}
          </h1>
          <div className="h-1 w-24 bg-gold mx-auto mb-8" />
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            {settings?.aboutPageSubtitle || "Mrigtrishna is a specialized production lab focused on high-fidelity environment art and technical optimization."}
          </p>
        </div>

        {/* === MAIN BIOGRAPHY === */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-32 items-center">
          <div className="md:col-span-7 space-y-8 text-lg text-slate-300 leading-8 order-2 md:order-1">
            <h2 className="text-3xl font-bold text-white leading-tight">
              {settings?.aboutHeading || "I am Niraj Kumar."}
            </h2>
            <div>{renderBodyText(settings?.aboutBody)}</div>
          </div>

          <div className="md:col-span-5 order-1 md:order-2">
              {/* Added hover:border-gold and transition-colors */}
              <div className="relative aspect-square w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-taupe/20 bg-navy-light shadow-2xl group hover:border-gold transition-colors duration-300">
                 {settings?.profileImage ? (
                   <Image 
                     src={settings.profileImage} 
                     alt="Niraj Kumar" 
                     fill 
                     // STRICT NO ZOOM: Removed all transition classes
                     className="object-cover" 
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center"><span className="text-gold font-bold text-4xl">NK</span></div>
                 )}
                 <div className="absolute inset-0 bg-linear-to-t from-navy/40 to-transparent pointer-events-none" />
              </div>
          </div>
        </div>

        {/* === TECHNICAL ARSENAL === */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <Layers className="text-gold" />
            <h2 className="text-2xl font-bold uppercase tracking-widest">Technical Arsenal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skills.length > 0 ? skills.map((skill) => (
              <div key={skill._id} className="bg-navy-light border border-taupe/20 p-8 rounded-xl hover:border-gold/30 transition-all duration-300 group">
                <div className="mb-6 text-gold group-hover:scale-110 transition-transform duration-500">
                  {iconMap[skill.icon] || <Box size={32} />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{skill.title}</h3>
                <p className="text-xs text-gold uppercase tracking-widest mb-6">{skill.category}</p>
                <ul className="space-y-3">
                  {skill.tools.map((tool) => (
                    <li key={tool} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="w-1.5 h-1.5 bg-taupe rounded-full group-hover:bg-gold transition-colors" />
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            )) : (
              <div className="col-span-3 text-center text-slate border border-dashed border-taupe p-8 rounded">No skills added yet.</div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}