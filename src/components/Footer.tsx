import React from 'react';
import { ArrowUp } from 'lucide-react';
import { siteConfig } from '../data/data.ts';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="pt-20 pb-12 overflow-hidden">
      {/* Massive Typography Banner Spanning the Width */}
      <div className="w-full select-none overflow-hidden pb-12 border-b border-neutral-200">
        <h2
          id="footer-massive-brand-text"
          className="w-full text-center font-bold tracking-tighter uppercase whitespace-nowrap text-[clamp(2rem,5.5vw,6.5rem)] leading-none select-none"
        >
          {siteConfig.siteTitle}
        </h2>
      </div>

      {/* Footer Sub-Metadata */}
      <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
        {/* Left: Copyright & Studio Note */}
        <div className="text-center md:text-left space-y-1">
          <p className="text-neutral-700 font-medium">
            {siteConfig.footerNote || `© ${new Date().getFullYear()} ${siteConfig.siteTitle}. ALL RIGHTS RESERVED.`}
          </p>
          <p className="text-neutral-400">
            ENGINEERED WITH REACT, TYPESCRIPT & TAILWIND CSS • ZERO EXTERNAL TRACKERS
          </p>
        </div>

        {/* Middle: Studio Location */}
        <div className="text-center hidden sm:block">
          <span>{siteConfig.studioNotice.location}</span>
          <span className="mx-2 text-neutral-300">•</span>
          <span>{siteConfig.studioNotice.coordinates}</span>
        </div>

        {/* Right: Scroll to top button */}
        <button
          onClick={scrollToTop}
          type="button"
          id="footer-scroll-top-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-300 bg-neutral-100 hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-all text-neutral-800"
        >
          <span>TOP</span>
          <ArrowUp className="w-3 h-3" />
        </button>
      </div>
    </footer>
  );
};
