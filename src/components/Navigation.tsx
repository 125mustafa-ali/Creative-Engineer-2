import React, { useState, useEffect } from 'react';
import { siteConfig } from '../data/data.ts';

interface NavigationProps {
  onOpenStudio?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenStudio }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="main-navigation"
      className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b ${
        scrolled
          ? 'bg-neutral-50/95 backdrop-blur-md border-neutral-200 shadow-xs'
          : 'bg-neutral-50 border-neutral-200/70'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Left */}
        <a
          href="#studio"
          id="nav-brand-link"
          className="group flex items-center gap-2.5 font-mono text-xs tracking-wider uppercase font-semibold text-neutral-950"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-neutral-950 group-hover:scale-125 transition-transform" />
          <span>{siteConfig.siteTitle}</span>
          <span className="hidden sm:inline-block text-[10px] text-neutral-400 font-normal">
            / {siteConfig.studioNotice.year || 'EST. 2026'}
          </span>
        </a>

        {/* Desktop Nav Links mapped dynamically from siteConfig.navLinks */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase text-neutral-600">
          {siteConfig.navLinks.map((link, idx) => (
            <a
              key={link.href}
              href={link.href}
              id={`nav-link-${link.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="hover:text-neutral-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-neutral-950 hover:after:w-full after:transition-all"
            >
              0{idx + 1} // {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="nav-mobile-toggle"
          type="button"
          className="md:hidden p-2 text-xs font-mono uppercase tracking-wider text-neutral-800 hover:text-neutral-950"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? 'CLOSE [✕]' : 'MENU [≡]'}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="nav-mobile-menu"
          className="md:hidden bg-neutral-50 border-b border-neutral-200 px-6 py-6 space-y-4 font-mono text-xs uppercase tracking-widest text-neutral-800"
        >
          {siteConfig.navLinks.map((link, idx) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 border-b border-neutral-100 hover:text-neutral-950"
            >
              0{idx + 1} // {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
