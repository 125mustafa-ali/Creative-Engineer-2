import React, { useState, useEffect } from 'react';
import { ArrowDownRight, Compass, ShieldCheck, MessageCircle } from 'lucide-react';
import { siteConfig, client } from '../data/data.ts';
import { HeroData } from '../data/types.ts';

interface HeroSectionProps {
  onOpenAiChat?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAiChat }) => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [detectedRatio, setDetectedRatio] = useState<'9:16' | '16:9'>('9:16');
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchHero() {
      try {
        // Precise Singleton GROQ Query
        const heroQuery = '*[_id == "hero-singleton"][0]';
        const data = await client.fetch<HeroData>(heroQuery);
        if (isMounted && data) {
          setHeroData(data);
        }
      } catch (err) {
        console.warn('Sanity hero fetch error, using fallback:', err);
      }
    }
    fetchHero();
    return () => {
      isMounted = false;
    };
  }, []);

  // Resilient Fallback Injection (Zero Layout Shift)
  const heading = heroData?.heading || siteConfig.heroStatement || 'CREATIVE ENGINEER';
  const subheading = heroData?.subheading || siteConfig.heroSubtext;
  const videoSrc = heroData?.backgroundVideoUrl || siteConfig.heroVideo?.url || '';

  return (
    <section
      id="studio"
      className="pt-16 pb-20 border-b border-neutral-200 relative overflow-hidden"
    >
      {/* Subtle background coordinate watermark */}
      <div className="absolute top-8 right-6 pointer-events-none opacity-20 hidden lg:block select-none">
        <span className="font-mono text-[9px] tracking-widest uppercase text-neutral-400">
          SYS://LOC.SPEC/{siteConfig.studioNotice.coordinates}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
        {/* Left Column: Typography & Status (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Status Pill & Geo Coordinates */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div
                id="hero-status-pill"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 bg-neutral-100/70 text-neutral-900 shadow-2xs"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="font-mono text-[10px] tracking-wider uppercase font-medium">
                  {siteConfig.studioNotice.status}
                </span>
              </div>

              <div
                id="hero-coordinates-meta"
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500"
              >
                <Compass className="w-3 h-3 text-neutral-400" />
                <span>{siteConfig.studioNotice.location}</span>
                <span className="text-neutral-300">•</span>
                <span>{siteConfig.studioNotice.coordinates}</span>
              </div>
            </div>

            {/* Large Serif Headline */}
            <h1
              id="hero-statement"
              className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-neutral-950 leading-[1.12] mb-8 font-normal"
            >
              {heading}
            </h1>

            {/* Smaller Sans-serif Subheadline */}
            <p
              id="hero-subtext"
              className="font-sans text-lg sm:text-xl text-neutral-700 leading-relaxed font-light max-w-2xl mb-10"
            >
              {subheading}
            </p>
          </div>

          {/* Quick Anchor Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-neutral-200/80">
            <a
              href="#work"
              id="hero-cta-work"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-neutral-950 text-neutral-50 font-mono text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <span>Explore Selected Work</span>
              <ArrowDownRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="#contact"
              id="hero-cta-contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-neutral-300 bg-transparent text-neutral-900 font-mono text-xs tracking-wider uppercase hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
            >
              <span>Initiate Dialogue</span>
            </a>
            <a
              href="https://wa.me/971545648341"
              target="_blank"
              rel="noopener noreferrer"
              id="hero-cta-whatsapp"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-neutral-300 bg-transparent text-neutral-900 font-mono text-xs tracking-wider uppercase hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
              aria-label="Contact via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right Column: Video with dynamic aspect ratio or fallback (5 cols) */}
        <div className="lg:col-span-5 flex items-center justify-center">
          {videoSrc ? (
            <div
              id="hero-video-container"
              className={`relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 transition-all duration-300 ${
                detectedRatio === '9:16' 
                  ? 'aspect-[9/16] max-w-[340px] mx-auto w-full' 
                  : 'aspect-video w-full'
              }`}
            >
              <video
                src={videoSrc}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                onLoadedMetadata={(e) => {
                  const { videoWidth, videoHeight } = e.currentTarget;
                  if (siteConfig.heroVideo?.aspectRatio && siteConfig.heroVideo.aspectRatio !== 'auto') {
                    setDetectedRatio(siteConfig.heroVideo.aspectRatio as '9:16' | '16:9');
                  } else {
                    setDetectedRatio(videoHeight > videoWidth ? '9:16' : '16:9');
                  }
                }}
                className="w-full h-full object-cover"
              />
              <button
                id="hero-video-sound-toggle"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted((prev) => !prev);
                }}
                className="absolute bottom-3 right-3 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs px-2.5 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 transition-colors"
                aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Sound On'}
              </button>
            </div>
          ) : (
            <div
              id="hero-portrait-placeholder"
              className="w-full aspect-[3/4] bg-neutral-200/60 rounded-lg border border-neutral-300/90 relative overflow-hidden flex flex-col justify-between p-6 shadow-xs group"
            >
              {/* Top Frame Tech Markings */}
              <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-neutral-500 border-b border-neutral-300/80 pb-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full inline-block" />
                  STUDIO IDENTITY // {siteConfig.studioNotice.year || 'EST. 2026'}
                </span>
                <span>{siteConfig.studioNotice.location}</span>
              </div>

              {/* Central Vector Geometric Visual Geometry (pure CSS placeholder pattern) */}
              <div className="relative w-full h-48 flex items-center justify-center">
                {/* Concentric rings */}
                <div className="w-36 h-36 rounded-full border border-neutral-400/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                  <div className="w-24 h-24 rounded-full border border-dashed border-neutral-500/60 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                    <div className="w-12 h-12 rounded-full border border-neutral-700/80 flex items-center justify-center bg-neutral-300/40">
                      <div className="w-2 h-2 rounded-full bg-neutral-950" />
                    </div>
                  </div>
                </div>

                {/* Crosshair lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-px bg-neutral-300/80" />
                  <div className="absolute h-full w-px bg-neutral-300/80" />
                </div>

                {/* Minimal scan line accent */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-neutral-400/30 to-transparent top-1/4 animate-pulse pointer-events-none" />
              </div>

              {/* Bottom Frame Details */}
              <div className="border-t border-neutral-300/80 pt-3 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-neutral-700">
                  <span className="font-semibold text-neutral-900">STUDIO PORTRAIT BUFFER</span>
                  <span className="text-neutral-500">ASPECT 3:4</span>
                </div>
                <p className="font-sans text-xs text-neutral-600 leading-snug">
                  {siteConfig.siteSubtitle || 'BUILDING SYSTEMS THAT WORK'} — Operating between {siteConfig.studioNotice.location}.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3 text-neutral-600" />
                  <span>MONOCHROME ARTIFACT LAYER // VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
