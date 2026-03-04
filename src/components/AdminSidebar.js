'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  BookOpen, 
  ShoppingBag, 
  Settings, 
  Award,
  LogOut,
  FileText, // <--- Added for Devlogs
  PenTool   // <--- Added for the Write Post CTA
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/admin/portfolio', icon: Briefcase },
    { name: 'Project Series', href: '/admin/journal', icon: BookOpen }, // Renamed slightly for clarity
    { name: 'Devlogs', href: '/admin/posts', icon: FileText }, // <--- New Devlogs Archive Link
    { name: 'Shop', href: '/admin/shop', icon: ShoppingBag },
    { name: 'Skills', href: '/admin/skills', icon: Award },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // The Logout Function
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/login');
        router.refresh(); 
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="w-64 border-r border-taupe/20 fixed h-full hidden md:flex flex-col bg-navy">
      {/* Studio Branding */}
      <div className="p-8">
        <h2 className="text-2xl font-bold tracking-tighter uppercase text-white">
          Mrig<span className="text-gold">Trishna</span>
        </h2>
        <p className="text-xs text-slate tracking-widest mt-1">Admin Console</p>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive 
                  ? 'bg-gold text-navy font-bold shadow-lg shadow-gold/20' 
                  : 'text-slate hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-navy' : 'text-slate group-hover:text-gold'} />
              <span className="text-sm uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}

        {/* The Action Button for New Posts */}
        <div className="pt-4 mt-4 border-t border-taupe/20">
          <Link 
            href="/admin/posts/new" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gold/10 text-gold border border-gold/20 hover:bg-gold hover:text-navy transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] group"
          >
            <PenTool size={18} className="text-gold group-hover:text-navy transition-colors" />
            <span className="text-sm font-bold uppercase tracking-widest group-hover:text-navy transition-colors">Write Post</span>
          </Link>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-taupe/20 space-y-2">
        <Link href="/" className="flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest text-slate hover:text-gold transition-colors">
          Exit to Site
        </Link>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}