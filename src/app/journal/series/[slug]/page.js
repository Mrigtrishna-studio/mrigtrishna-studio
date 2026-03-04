'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function SeriesDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [series, setSeries] = useState(null);
  const [posts, setPosts] = useState([]); // <-- We now have a place to store the logs!
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch the Cinematic Series Data
        const resSeries = await fetch(`/api/journal/series/${slug}`);
        const seriesResult = await resSeries.json();
        
        if (seriesResult.success && seriesResult.data) {
          setSeries(seriesResult.data);
          
          // 2. Fetch the actual Devlog Posts linked to this Series
          const resPosts = await fetch(`/api/posts?seriesId=${seriesResult.data._id}`);
          const postsResult = await resPosts.json();
          
          if (postsResult.success) {
            setPosts(postsResult.data || []);
          }
        }
      } catch (error) {
        console.error("Failed to load series data");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a1120] flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={40} />
      </main>
    );
  }

  if (!series) {
    return (
      <main className="min-h-screen bg-[#0a1120] text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">Archive not found.</h1>
        <Link href="/journal" className="text-gold hover:underline flex items-center gap-2 transition-transform hover:-translate-x-1">
          <ArrowLeft size={16} /> Return to Journal
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a1120] text-white flex flex-col">
      <Navbar />
      
      {/* --- CINEMATIC HERO SECTION --- */}
      <div className="w-full h-[50vh] md:h-[60vh] relative mt-20 border-b border-white/5">
        <Image 
          src={series.coverImage || '/placeholder.webp'} 
          alt={series.title} 
          fill 
          priority /* <-- This fixes your Next.js Console Warning! */
          className="object-cover opacity-40" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-[#0a1120]/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-7xl mx-auto">
          <Link href="/journal" className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold mb-6 hover:-translate-x-2 transition-transform">
            <ArrowLeft size={14} /> Back to Gallery
          </Link>
          <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-tight mb-4 text-white">
            {series.title}
          </h1>
          <p className="text-slate/80 text-lg md:text-xl max-w-3xl line-clamp-3">
            {series.description}
          </p>
        </div>
      </div>

      {/* --- DEVLOG GRID --- */}
      <div className="grow py-20 px-6 max-w-7xl mx-auto w-full">
        <header className="mb-12 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-widest uppercase border-l-4 border-gold pl-4">
            Production <span className="text-gold">Logs</span>
          </h2>
          <span className="text-slate text-sm font-bold uppercase tracking-widest">{posts.length} Entries</span>
        </header>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link href={`/journal/post/${post.slug}`} key={post._id} className="group block">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-navy-light mb-4 border border-white/5 group-hover:border-gold/30 transition-colors">
                  <Image 
                    src={post.coverImage || '/placeholder.webp'} 
                    alt={post.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold group-hover:text-gold transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-slate/60 text-sm line-clamp-2 mb-3">
                    {post.excerpt || "View the production details inside..."}
                  </p>
                  <div className="flex items-center gap-2 text-gold text-[10px] uppercase tracking-widest font-bold">
                    Read Log <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-slate italic">
              The development logs for {series.title} have not been published yet.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}