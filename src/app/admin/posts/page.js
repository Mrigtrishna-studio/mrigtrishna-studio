'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Edit, Trash2, Search } from 'lucide-react';

export default function PostsDashboard() {
  const [posts, setPosts] = useState([]);
  const [seriesMap, setSeriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch both posts and series simultaneously
        const [postsRes, seriesRes] = await Promise.all([
          fetch('/api/posts', { cache: 'no-store' }),
          fetch('/api/journal', { cache: 'no-store' })
        ]);

        const postsData = await postsRes.json();
        const seriesData = await seriesRes.json();

        if (postsData.success) setPosts(postsData.data || []);
        
        // Create a lookup map so we can show the Series Title instead of just the ID
        if (seriesData.success) {
          const map = {};
          seriesData.data.forEach(s => {
            map[s._id] = s.title;
          });
          setSeriesMap(map);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this devlog? This cannot be undone.')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setPosts(posts.filter(post => post._id !== id));
      } else {
        alert('Failed to delete post.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full text-white">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest text-white">
            Devlog <span className="text-gold">Archive</span>
          </h1>
          <p className="text-xs text-slate tracking-widest mt-2 uppercase">Manage your production logs</p>
        </div>
        
        <Link 
          href="/admin/posts/new" 
          className="flex items-center gap-2 bg-gold text-navy px-6 py-3 rounded-lg font-bold uppercase tracking-widest hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
        >
          <Plus size={18} /> Compose Log
        </Link>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-[#162033]/50 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-gold" size={40} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Search size={24} className="text-slate" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">No Devlogs Found</h3>
            <p className="text-slate text-sm mb-6 max-w-md mx-auto">
              You haven't documented any production logs yet. Click compose to start writing.
            </p>
            <Link 
              href="/admin/posts/new" 
              className="inline-flex items-center gap-2 text-gold font-bold uppercase tracking-widest text-xs hover:underline"
            >
              Write First Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-navy border-b border-white/10 text-xs uppercase tracking-widest text-slate">
                  <th className="p-6 font-bold">Post Title</th>
                  <th className="p-6 font-bold">Series</th>
                  <th className="p-6 font-bold">Date Published</th>
                  <th className="p-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-white line-clamp-1">{post.title}</p>
                      <p className="text-xs text-slate mt-1 line-clamp-1">{post.slug}</p>
                    </td>
                    <td className="p-6">
                      <span className="bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gold/20">
                        {seriesMap[post.seriesId] || 'Unknown Series'}
                      </span>
                    </td>
                    <td className="p-6 text-sm text-slate">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-6 flex justify-end gap-3">
                      {/* Note: We will build the edit page next! */}
                      <Link 
                        href={`/admin/posts/edit/${post._id}`}
                        className="p-2 bg-navy border border-white/10 rounded-lg text-slate hover:text-white hover:border-white/30 transition-all"
                        title="Edit Post"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(post._id)}
                        disabled={deletingId === post._id}
                        className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        title="Delete Post"
                      >
                        {deletingId === post._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}