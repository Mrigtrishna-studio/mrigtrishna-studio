'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function JournalPage() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeries() {
      try {
        const res = await fetch('/api/journal', { cache: 'no-store' });
        const data = await res.json();
        setSeries(data.data || []);
      } catch (error) {
        console.error("Failed to load series");
      } finally {
        setLoading(false);
      }
    }
    fetchSeries();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a1120] text-white flex flex-col">
      <Navbar />
      
      <div className="grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        
        {/* --- HEADER --- */}
        <header className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-widest uppercase border-l-4 border-gold pl-4">
            Project <span className="text-gold">Series</span>
          </h1>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gold" size={40} />
          </div>
        ) : (
          <>
            {/* --- SERIES GALLERY --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {series.map((item) => (
                <Link 
                  href={`/journal/series/${item.slug}`} 
                  key={item._id} 
                  className="group relative aspect-video rounded-xl overflow-hidden bg-navy-light border border-white/5"
                >
                  <Image 
                    src={item.coverImage || '/placeholder.webp'} 
                    alt={item.title} 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-navy/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <h2 className="text-lg font-bold text-gold">{item.title}</h2>
                    <p className="text-xs text-slate/80 mt-1 line-clamp-1">View Production Archive</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* --- EMPTY STATE --- */}
            {series.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 mt-6">
                <p className="text-slate italic">The archives are currently empty.</p>
              </div>
            )}
          </>
        )}

      </div>
      <Footer />
    </main>
  );
}