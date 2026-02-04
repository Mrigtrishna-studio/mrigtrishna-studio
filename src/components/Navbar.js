'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() { // <--- MUST SAY 'export default'
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Shop', path: '/shop' },
    { name: 'Journal', path: '/journal' },
    { name: 'About', path: '/about' },
    { name: 'Contact Me', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-navy/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
          MRIG<span className="text-gold">TRISHNA</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.path}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                pathname === link.path ? 'text-gold' : 'text-slate hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 absolute w-full">
          <div className="flex flex-col p-6 gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-bold uppercase tracking-widest ${
                  pathname === link.path ? 'text-gold' : 'text-slate'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}