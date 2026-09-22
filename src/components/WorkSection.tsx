import React, { useState, useEffect } from 'react';
import { ArrowUpRight, FolderGit2, Film, Eye } from 'lucide-react';
import type { PortfolioItem } from '../types.ts';
import { portfolioWork, fetchPortfolioWork } from '../data/data.ts';

interface WorkSectionProps {
  onSelectProject: (project: PortfolioItem) => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({ onSelectProject }) => {
  const [works, setWorks] = useState<PortfolioItem[]>(portfolioWork);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let lastFetched = 0;
    const STALE_TIME = 30 * 1000;

    const loadData = () => {
      setIsLoading(true);
      fetchPortfolioWork()
        .then((data) => {
          if (isMounted && data && data.length > 0) {
            setWorks(data);
            lastFetched = Date.now();
          }
        })
        .catch((err) => {
          console.warn('Fallback to local portfolio data:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    };

    loadData();

    const handleFocus = () => {
      if (Date.now() - lastFetched > STALE_TIME) {
        loadData();
      }
    };

    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('sanity:refresh', handleRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('sanity:refresh', handleRefresh);
    };
  }, []);

  return (
    <section id="work" className="py-20 border-b border-neutral-200 relative">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
            <FolderGit2 className="w-3 h-3 text-neutral-700" />
            <span>SECTION 03 // ARCHIVAL DOSSIERS</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-neutral-950 uppercase tracking-tight font-normal">
            SELECTED WORK
          </h2>
        </div>
        <div className="font-mono text-xs text-neutral-500 uppercase tracking-wider flex items-center gap-2">
          <span>CATALOG: {works.length} ARTIFACTS</span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-700">CLICK CARD FOR DOSSIER</span>
        </div>
      </div>

      {/* 4-Item Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {works.map((item, index) => {
          const spotsCount = (item.gallery && item.gallery.length) || (item.anthologySpots && item.anthologySpots.length) || 0;
          const isAnthology = Boolean(item.isAnthology);
          const cardVideoUrl = (
            item.videoUrl ||
            item.gallery?.[0]?.videoUrl ||
            item.anthologySpots?.[0]?.videoUrl ||
            item.anthologySpots?.[0]?.heroReelUrl ||
            ''
          ).trim();

          // Extract clean excerpt from markdownContext if summary is absent
          const cleanExcerpt = item.summary || (
            item.markdownContext
              .replace(/^#+.*$/m, '')
              .replace(/\*\*/g, '')
              .replace(/[-*•]/g, '')
              .trim()
              .slice(0, 160) + '...'
          );

          return (
            <article
              key={item.id}
              id={`portfolio-card-${item.id}`}
              onClick={() => onSelectProject(item)}
              className="group cursor-pointer rounded-lg border border-neutral-300/80 bg-neutral-100/40 p-5 hover:border-neutral-950 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Card Top Meta */}
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-3">
                  <span className="text-neutral-400 group-hover:text-neutral-950 transition-colors">
                    REF 0{index + 1} // {item.year}
                  </span>
                  <div className="flex items-center gap-2">
                    {isAnthology && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-900 text-[9px] font-mono">
                        <Film className="w-2.5 h-2.5" />
                        ANTHOLOGY ({spotsCount} SPOTS)
                      </span>
                    )}
                    <span className="text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex items-center gap-1">
                      VIEW <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Media Thumbnail Container with Video Background */}
                <div
                  id={`thumbnail-container-${item.id}`}
                  className="w-full aspect-video bg-neutral-950 rounded-md border border-neutral-300/80 mb-5 relative overflow-hidden group-hover:border-neutral-950 transition-colors"
                >
                  {item.thumbnailVideo ? (
                    <video
                      src={item.thumbnailVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover rounded-t-md"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-black rounded-t-md" />
                  )}
                </div>

                {/* Discipline in Mono */}
                <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                  {item.discipline}
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl sm:text-2xl text-neutral-950 uppercase tracking-tight leading-snug mb-3 group-hover:text-black">
                  {item.title}
                </h3>

                {/* Summary / Excerpt */}
                <p className="font-sans text-xs sm:text-sm text-neutral-600 font-light leading-relaxed mb-4 line-clamp-2">
                  {cleanExcerpt}
                </p>
              </div>

              {/* Bottom Card Footer with Client / Size Meta */}
              <div className="pt-4 border-t border-neutral-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-sm bg-neutral-200/70 text-neutral-700">
                    {item.client}
                  </span>
                  {item.size && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-neutral-400">
                      {item.size}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 group-hover:text-neutral-900 transition-colors font-medium">
                  EXPAND ↗
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
