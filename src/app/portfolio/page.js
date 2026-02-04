'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ExternalLink, Tag } from 'lucide-react';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch('/api/portfolio', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) setPortfolio(data.data);
      } catch (error) {
        console.error("Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  return (
    <main className="min-h-screen bg-navy text-white selection:bg-gold selection:text-navy flex flex-col">
      <Navbar />

      <div className="grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4">
            Selected <span className="text-gold">Work</span>
          </h1>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            A collection of environment art, technical breakdowns, and procedural tools.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gold" size={40} />
          </div>
        )}

        {/* Portfolio Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio.map((item) => (
              <Link 
                href={item.artstationLink} 
                target="_blank" 
                key={item._id} 
                // Added hover:border-gold and transition-colors
                className="group relative aspect-4/3 overflow-hidden rounded-xl bg-navy-light border border-taupe/20 hover:border-gold transition-colors duration-300"
              >
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill 
                  // STRICT NO ZOOM: Only opacity transition allowed.
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-gold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Tag size={12} /> {item.category}
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
                      View on ArtStation <ExternalLink size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && portfolio.length === 0 && (
          <div className="text-center py-20 border border-dashed border-taupe/20 rounded-xl">
             <p className="text-slate">No portfolio projects found.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}