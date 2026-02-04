'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export default function JournalPage() {
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchJournal() {
      try {
        const res = await fetch('/api/journal', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          // Sort by date (newest first)
          const sorted = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setJournal(sorted);
        }
      } catch (error) {
        console.error("Failed to load journal");
      } finally {
        setLoading(false);
      }
    }
    fetchJournal();
  }, []);

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = journal.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(journal.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <main className="min-h-screen bg-navy text-white selection:bg-gold selection:text-navy flex flex-col">
      <Navbar />

      <div className="grow pt-32 pb-20 px-6 max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4">
            The <span className="text-gold">Journal</span>
          </h1>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            Documenting the process, technical breakdowns, and development logs.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gold" size={40} />
          </div>
        )}

        {/* Journal List (Paginated) */}
        {!loading && (
          <div className="space-y-12">
            {currentItems.map((item) => (
              <Link 
                href={item.hashnodeLink || '#'} // <--- FIX: Uses your external link now
                target="_blank"                 // <--- FIX: Opens in new tab
                key={item._id} 
                className="group grid grid-cols-1 md:grid-cols-5 gap-8 bg-navy border border-taupe/20 p-6 rounded-2xl hover:border-gold transition-colors duration-300"
              >
                
                {/* Image */}
                <div className="md:col-span-2 h-64 md:h-auto relative rounded-xl overflow-hidden">
                  {item.thumbnail ? (
                    <Image 
                      src={item.thumbnail} 
                      alt={item.title} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-navy-light flex items-center justify-center text-slate">
                      <ExternalLink />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:col-span-3 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-xs text-gold uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(item.createdAt)}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 leading-tight group-hover:text-gold transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-slate mb-6 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white group-hover:text-gold transition-colors">
                    Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && journal.length === 0 && (
          <div className="text-center py-20 border border-dashed border-taupe/20 rounded-xl">
             <p className="text-slate">No journal entries found.</p>
          </div>
        )}

        {/* --- PAGINATION CONTROLS --- */}
        {!loading && journal.length > itemsPerPage && (
          <div className="flex justify-center items-center gap-6 mt-20 pt-10 border-t border-taupe/20">
            
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-full uppercase text-xs font-bold tracking-widest transition-all ${
                currentPage === 1 
                  ? 'text-slate opacity-50 cursor-not-allowed' 
                  : 'bg-navy-light text-white hover:bg-gold hover:text-navy hover:shadow-lg hover:shadow-gold/20'
              }`}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span className="text-sm font-bold text-gold tracking-widest">
              PAGE {currentPage} / {totalPages}
            </span>

            <button 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-6 py-3 rounded-full uppercase text-xs font-bold tracking-widest transition-all ${
                currentPage === totalPages 
                  ? 'text-slate opacity-50 cursor-not-allowed' 
                  : 'bg-navy-light text-white hover:bg-gold hover:text-navy hover:shadow-lg hover:shadow-gold/20'
              }`}
            >
              Next <ChevronRight size={16} />
            </button>
            
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}