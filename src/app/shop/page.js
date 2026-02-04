'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Loader2, ShoppingCart, Tag, DollarSign } from 'lucide-react'; // <--- Added DollarSign

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    async function fetchShop() {
      try {
        const res = await fetch('/api/shop', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
          setFilteredProducts(data.data);

          // Dynamic Categories
          const allCats = data.data.map(item => item.category);
          const uniqueCats = ['All', ...new Set(allCats)];
          setCategories(uniqueCats);
        }
      } catch (error) {
        console.error("Failed to load shop");
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
  }, []);

  const handleFilter = (category) => {
    setActiveFilter(category);
    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(item => item.category === category));
    }
  };

  return (
    <main className="min-h-screen bg-navy text-white selection:bg-gold selection:text-navy flex flex-col">
      <Navbar />

      <div className="flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-4">
            Asset <span className="text-gold">Store</span>
          </h1>
          <p className="text-slate text-lg max-w-2xl mx-auto">
            High-quality shaders, models, and tools to speed up your workflow.
          </p>
        </div>

        {/* Filter Bar */}
        {!loading && (
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                  activeFilter === cat 
                    ? 'bg-gold text-navy border-gold' 
                    : 'bg-transparent text-slate border-taupe/30 hover:border-gold hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gold" size={40} />
          </div>
        )}

        {/* Product Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((item) => (
              <div key={item._id} className="group bg-navy-light border border-taupe/20 rounded-xl overflow-hidden hover:border-gold/50 transition-all duration-300 flex flex-col">
                
                {/* Image Section */}
                <div className="relative aspect-square w-full overflow-hidden bg-black">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    // FIX: Removed 'group-hover:scale-110' so it does not zoom
                    className="object-cover transition-opacity duration-500 opacity-90 group-hover:opacity-100" 
                  />
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-navy/90 backdrop-blur text-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gold/20">
                    {item.category}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-gold transition-colors">
                    {item.title}
                  </h3>
                  
                  {/* Price & Buy Button */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                    
                    {/* FIX: Added Dollar Logo & formatting */}
                    <div className="flex items-center gap-1 text-white">
                      <DollarSign size={18} className="text-gold" />
                      <span className="text-xl font-bold">{item.price.replace('$', '')}</span>
                    </div>

                    <a 
                      href={item.gumroadLink} 
                      target="_blank"
                      className="bg-white text-navy px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors flex items-center gap-2"
                    >
                      Buy <ShoppingCart size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 border border-dashed border-taupe/20 rounded-xl">
             <Tag className="mx-auto text-slate mb-4 opacity-50" size={40} />
             <p className="text-slate">No products found in this category.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}