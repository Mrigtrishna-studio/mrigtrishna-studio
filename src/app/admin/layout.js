'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  BookOpen, 
  ShoppingBag, 
  Settings, 
  Award // <--- Added this Import
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/admin/portfolio', icon: Briefcase },
    { name: 'Journal', href: '/admin/journal', icon: BookOpen },
    { name: 'Shop', href: '/admin/shop', icon: ShoppingBag },
    { name: 'Skills', href: '/admin/skills', icon: Award }, // <--- FIXED: Matches structure
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-navy flex text-white font-sans selection:bg-gold selection:text-navy">
      {/* Sidebar */}
      <aside className="w-64 border-r border-taupe/20 fixed h-full hidden md:flex flex-col">
        <div className="p-8">
          <h2 className="text-2xl font-bold tracking-tighter uppercase">
            Mrig<span className="text-gold">Trishna</span>
          </h2>
          <p className="text-xs text-slate tracking-widest mt-1">Admin Console</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
                {/* Dynamically render the icon component */}
                <item.icon size={18} className={isActive ? 'text-navy' : 'text-slate group-hover:text-gold'} />
                <span className="text-sm uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-taupe/20">
          <Link href="/" className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate hover:text-gold transition-colors">
            Exit to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}