'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [heroSettings, setHeroSettings] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);

  // === YOUTUBE PARSER ===
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      let videoId = null;
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('/shorts/')) {
        videoId = url.split('/shorts/')[1].split('?')[0];
      } else if (url.includes('/embed/')) {
        videoId = url.split('/embed/')[1].split('?')[0];
      }
      if (!videoId) return null;
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&playsinline=1`;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const settingsRes = await fetch('/api/settings', { cache: 'no-store' });
        const settingsData = await settingsRes.json();
        if (settingsData.success) setHeroSettings(settingsData.data);

        const portRes = await fetch('/api/portfolio', { cache: 'no-store' });
        const portData = await portRes.json();
        if (portData.success) setPortfolio(portData.data.slice(0, 3));

        const jourRes = await fetch('/api/journal', { cache: 'no-store' });
        const jourData = await jourRes.json();
        if (jourData.success) setJournal(jourData.data.slice(0, 3));
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <main className="min-h-screen bg-navy flex items-center justify-center"><Loader2 className="animate-spin text-gold" size={40} /></main>;

  return (
    <main className="min-h-screen bg-navy text-white selection:bg-gold selection:text-navy">
      <Navbar />

      {/* === HERO SECTION === */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        {heroSettings?.heroVideo && getEmbedUrl(heroSettings.heroVideo) ? (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <iframe
              src={getEmbedUrl(heroSettings.heroVideo)}
              className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 opacity-60"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
              title="Background Video"
              style={{ pointerEvents: 'none' }}
            />
          </div>
        ) : (
          // FIXED: bg-linear -> bg-gradient
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-navy via-black to-navy" />
        )}
        {/* FIXED: bg-linear -> bg-gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent z-10" />
        <div className="relative z-20 text-center px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter mb-4 leading-[0.9]">
            {heroSettings?.heroText || "Mrigtrishna"}
          </h1>
          <p className="text-gold text-sm md:text-lg tracking-[0.3em] uppercase font-medium">
            The Portfolio
          </p>
        </div>
      </section>

      {/* === LATEST WORK === */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-20">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold uppercase tracking-tight">Latest <span className="text-slate">Work</span></h2>
          <Link href="/portfolio" className="text-xs font-bold text-gold uppercase tracking-widest hover:text-white transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portfolio.map((item) => (
            <Link 
              href={item.artstationLink} 
              target="_blank" 
              key={item._id} 
              // FIXED: aspect-4/5 -> aspect-[4/5]
              className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-navy-light border border-taupe/20 hover:border-gold transition-colors duration-300"
            >
              <Image 
                src={item.image} 
                alt={item.title} 
                fill 
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
              />
              {/* FIXED: bg-linear -> bg-gradient */}
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-navy to-transparent pt-20">
                <p className="text-xs text-gold uppercase tracking-widest mb-1">{item.category}</p>
                <h3 className="text-xl font-bold text-white group-hover:translate-x-2 transition-transform">{item.title}</h3>
              </div>
            </Link>
          ))}
          {portfolio.length === 0 && !loading && (
             <div className="col-span-3 text-center py-12 border border-dashed border-taupe/30 rounded-lg">
               <p className="text-slate mb-2">No projects found.</p>
               <Link href="/login" className="text-gold text-xs uppercase tracking-widest hover:underline">Manage Portfolio</Link>
             </div>
          )}
        </div>
      </section>

      {/* === LATEST JOURNAL === */}
      <section className="py-24 px-6 bg-navy-light/30 border-y border-taupe/20 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-tight">The <span className="text-slate">Journal</span></h2>
            <Link href="/journal" className="text-xs font-bold text-gold uppercase tracking-widest hover:text-white transition-colors">
              Read All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {journal.map((item) => (
              <Link 
                href={`/journal/${item._id}`}
                key={item._id} 
                className="group block bg-navy border border-taupe/20 p-6 rounded-xl hover:border-gold transition-colors duration-300"
              >
                <div className="h-48 relative mb-6 rounded overflow-hidden">
                  <Image 
                    src={item.thumbnail} 
                    alt={item.title} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-gold transition-colors">{item.title}</h3>
                <p className="text-slate text-sm line-clamp-3 mb-4">{item.description}</p>
                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">Read Article <ExternalLink size={12} /></span>
              </Link>
            ))}
             {journal.length === 0 && !loading && (
               <div className="col-span-3 text-center py-12">
                 <p className="text-slate">No journal entries yet.</p>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* === WHO AM I (FIXED) === */}
      <section className="py-32 px-6 max-w-6xl mx-auto relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT: Image Container - Simplified */}
          {/* FIXED: Removed min-h, fixed bg-gradient, kept aspect-square */}
          <div className="relative w-full aspect-square max-w-md mx-auto md:mr-auto rounded-3xl overflow-hidden border border-taupe/20 bg-navy-light shadow-2xl group hover:border-gold transition-colors duration-300">
             {heroSettings?.profileImage ? (
               <Image 
                 src={heroSettings.profileImage} 
                 alt="Niraj Kumar" 
                 fill 
                 className="object-cover"
                 // Added sizes prop for performance and correct sizing
                 sizes="(max-width: 768px) 100vw, 50vw" 
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gold font-bold text-4xl">NK</span>
               </div>
             )}
             {/* FIXED: bg-linear -> bg-gradient */}
             <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent pointer-events-none" />
          </div>

          {/* RIGHT: Content */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Who is <br/><span className="text-gold">Niraj Kumar?</span>
            </h2>
            
            <p className="text-slate text-lg leading-relaxed mb-8 whitespace-pre-wrap">
              {heroSettings?.profileDescription || "A Technical Artist and Developer bridging the gap between creative storytelling and real-time engineering. I build worlds, optimize pipelines, and craft digital experiences."}
            </p>

            <Link 
              href="/about" 
              className="inline-flex items-center gap-3 border border-gold text-gold px-8 py-4 rounded-full uppercase text-xs font-bold tracking-widest hover:bg-gold hover:text-navy transition-all"
            >
              Read Full Story <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}