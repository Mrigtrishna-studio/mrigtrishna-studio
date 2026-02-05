'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Linkedin, 
  Instagram, 
  Youtube, 
  Mail, 
  ArrowRight
} from 'lucide-react';

// === CUSTOM ARTSTATION ICON (Official Logo) ===
const ArtStationIcon = ({ size = 20, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12.016 4.72L24 22H20.06L12.016 8.78L4.35 22H0L12.016 4.72ZM10.426 15.34L12.016 12.78L13.626 15.34H10.426ZM12.016 10.6L16.296 17.5H7.736L12.016 10.6Z" />
  </svg>
);

export default function Footer() {
  const [settings, setSettings] = useState(null);
  
  // 1. Fetch Admin Settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error("Failed to load footer settings");
      }
    }
    fetchSettings();
  }, []);

  // 2. Icon Helper
  const getIcon = (platform) => {
    switch(platform) {
      case 'linkedin':   return <Linkedin size={20} />;
      case 'instagram':  return <Instagram size={20} />;
      case 'youtube':    return <Youtube size={20} />;
      case 'artstation': return <ArtStationIcon size={20} />; // <--- Uses Custom Icon
      default: return null;
    }
  };

  // 3. Define Order
  const allowedSocials = ['linkedin', 'artstation', 'instagram', 'youtube'];

  return (
    <footer className="bg-navy border-t border-taupe/20 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* === LEFT: EMAIL & CONTACT LINK === */}
        <div className="text-center md:text-left space-y-4">
          
          {/* Dynamic Email */}
          <div className="flex items-center gap-2 justify-center md:justify-start text-slate-300 hover:text-white transition-colors">
            <Mail size={16} className="text-gold" />
            <a href={`mailto:${settings?.contactEmail || 'contact@mrigtrishna.com'}`} className="text-sm tracking-wider">
              {settings?.contactEmail || 'contact@mrigtrishna.com'}
            </a>
          </div>

          {/* Contact Page Link */}
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Go to Contact Page <ArrowRight size={14} />
          </Link>
        </div>

        {/* === RIGHT: DYNAMIC SOCIAL ICONS === */}
        <div className="flex items-center gap-4">
          {settings?.socials && allowedSocials.map((platform) => {
            const item = settings.socials[platform];
            
            // Only show if: 1. It exists in DB, 2. 'Show' is true, 3. URL is not empty
            if (item && item.show && item.url) {
              return (
                <a 
                  key={platform} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-navy-light border border-taupe/20 text-slate hover:border-gold hover:text-gold hover:bg-navy transition-all duration-300"
                  title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                >
                  {getIcon(platform)}
                </a>
              );
            }
            return null;
          })}
        </div>

      </div>

      {/* Copyright */}
      <div className="text-center mt-12 pt-8 border-t border-taupe/10">
        <p className="text-slate text-[10px] uppercase tracking-widest">
          © {new Date().getFullYear()} MrigTrishna Studio. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}