import Link from 'next/link';
import { Instagram, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy border-t border-taupe/20 py-16">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-white tracking-tight">MRIGTRISHNA STUDIO</h2>
          <p className="text-slate text-sm mt-2">© {new Date().getFullYear()} Niraj Kumar. All rights reserved.</p>
        </div>

        {/* Socials */}
        <div className="flex gap-6">
          <a href="#" className="text-slate hover:text-gold transition-colors"><Instagram size={20} /></a>
          <a href="#" className="text-slate hover:text-gold transition-colors"><Twitter size={20} /></a>
          <a href="#" className="text-slate hover:text-gold transition-colors"><Linkedin size={20} /></a>
          <a href="#" className="text-slate hover:text-gold transition-colors"><Github size={20} /></a>
        </div>

      </div>
    </footer>
  );
}