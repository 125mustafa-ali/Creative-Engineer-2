import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { X, Play, Film, ChevronRight, Check } from 'lucide-react';
import type { PortfolioItem, GallerySpot } from '../types.ts';

interface ProjectModalProps {
  isOpen: boolean;
  project: PortfolioItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  project,
  onClose,
}) => {
  const [selectedSpotIndex, setSelectedSpotIndex] = useState<number>(0);

  // Normalize spots array from either gallery or anthologySpots
  const spots: GallerySpot[] = React.useMemo(() => {
    if (!project) return [];
    if (project.gallery && project.gallery.length > 0) return project.gallery;
    if (project.anthologySpots && project.anthologySpots.length > 0) return project.anthologySpots;
    return [];
  }, [project]);

  const isAnthology = Boolean(project?.isAnthology && spots.length > 0);

  // Reset selected spot when project changes
  useEffect(() => {
    setSelectedSpotIndex(0);
  }, [project?.id]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  // Resolve currently active sub-spot or root project
  const activeSpot: GallerySpot | null =
    isAnthology && spots[selectedSpotIndex] ? spots[selectedSpotIndex] : null;

  const currentMarkdown = activeSpot
    ? activeSpot.markdownContext
    : project.markdownContext;

  const currentAspectRatio = (activeSpot?.aspectRatio || project.aspectRatio || '16:9').trim();
  const isVertical = currentAspectRatio === '9:16' || currentAspectRatio === 'vertical';

  const currentDisplayTitle = activeSpot
    ? `${project.title} // ${activeSpot.title}`
    : project.title;

  // Resolve video URL: check spot videoUrl, fullVideoUrl, heroReelUrl, or root project videoUrl
  const rawVideoUrl = (
    activeSpot?.videoUrl ||
    activeSpot?.fullVideoUrl ||
    activeSpot?.heroReelUrl ||
    project.videoUrl ||
    ''
  ).trim();

  // Accept and attempt to load any defined video URL (both remote and relative local paths)
  const hasVideo = Boolean(rawVideoUrl);

  return (
    <div
      id="project-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-neutral-950/75 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="project-modal-container"
        className="relative w-full max-w-4xl bg-neutral-50 border border-neutral-300 rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-project-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-100/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-neutral-950 rounded-full" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600 font-medium">
              PROJECT ARCHIVE // {project.discipline}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {project.year}
            </span>
            {isAnthology && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[9px] uppercase tracking-wider">
                <Film className="w-2.5 h-2.5" />
                ANTHOLOGY ({spots.length} SPOTS)
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            id="modal-close-button"
            type="button"
            className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200 transition-colors"
            aria-label="Close project modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          {/* Main Titles */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
              CLIENT: {project.client.toUpperCase()} // SIZE: {project.size?.toUpperCase() || 'STANDARD'}
            </div>
            <h2
              id="modal-project-title"
              className="font-serif text-2xl sm:text-4xl text-neutral-950 tracking-tight leading-tight uppercase font-normal mb-2"
            >
              {currentDisplayTitle}
            </h2>
            {activeSpot?.badge && (
              <div className="inline-block px-2 py-0.5 rounded-sm bg-neutral-200 text-neutral-800 font-mono text-[10px] uppercase tracking-wider mb-2">
                BADGE: {activeSpot.badge}
              </div>
            )}
          </div>

          {/* Main Media Viewer (Respecting aspect ratio: 16:9 vs 9:16) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              <span>
                MEDIA // DURATION {activeSpot?.duration || project.duration || '1:00'}
              </span>
            </div>

            <div
              id="modal-main-media-container"
              className={`w-full relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-inner transition-all duration-300 ${
                isVertical
                  ? 'max-w-xs sm:max-w-sm mx-auto aspect-[9/16]'
                  : 'aspect-video'
              }`}
            >
              {hasVideo ? (
                <video
                  key={activeSpot?.videoUrl || rawVideoUrl || 'main-video'}
                  src={rawVideoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  ref={(el) => {
                    if (el) {
                      el.setAttribute('muted', '');
                      el.defaultMuted = true;
                      el.muted = true;
                      el.play().catch(() => {}); // ONLY the main video gets the play() trigger
                    }
                  }}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div
                  id="modal-main-media-placeholder"
                  className="w-full h-full flex flex-col justify-between p-6 text-neutral-100"
                >
                  {/* Internal Media Tech HUD Overlay */}
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      REC // RENDER BUFFER
                    </span>
                    <span>{isVertical ? 'VERTICAL 9:16' : 'WIDESCREEN 16:9'}</span>
                  </div>

                  {/* Center Kinetic Simulation Graphics (pure CSS placeholder pattern) */}
                  <div className="relative flex flex-col items-center justify-center my-auto py-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-neutral-700 flex items-center justify-center animate-pulse shadow-lg bg-neutral-900/60">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-dashed border-neutral-400 flex items-center justify-center">
                        <Play className="w-5 h-5 text-neutral-200 ml-0.5" />
                      </div>
                    </div>

                    {/* Subtitle within simulator */}
                    <div className="mt-4 text-center px-4">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-200 block font-medium">
                        {activeSpot ? activeSpot.title : project.title}
                      </span>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-neutral-500 block mt-0.5">
                        PURE CSS SYNTHETIC MEDIA RUNTIME // NO VIDEO STREAM DETECTED
                      </span>
                    </div>
                  </div>

                  {/* Bottom HUD Bar */}
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-neutral-400 border-t border-neutral-800/80 pt-2">
                    <span>FPS: 60.00 SOLID</span>
                    <span>CH: {activeSpot?.tag?.toUpperCase() || project.discipline.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Anthology Logic: Horizontal Scrollable Row (Reel) if isAnthology is true */}
          {isAnthology && (
            <div id="anthology-reel-section" className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-700 font-semibold">
                  <Film className="w-3.5 h-3.5 text-neutral-950" />
                  <span>ANTHOLOGY REEL // SELECT SPOT ({spots.length} ARTIFACTS)</span>
                </div>
                <span className="font-mono text-[10px] uppercase text-neutral-400 hidden sm:inline">
                  CLICK SPOT TO UPDATE ACTIVE DEBRIEF
                </span>
              </div>

              {/* Horizontal Scrollable Row */}
              <div className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                {spots.map((spot, idx) => {
                  const isSelected = selectedSpotIndex === idx;
                  const spotVideoUrl = (
                    spot.videoUrl ||
                    spot.heroReelUrl ||
                    spot.fullVideoUrl ||
                    ''
                  ).trim();

                  return (
                    <button
                      key={spot.title + idx}
                      id={`anthology-spot-btn-${idx + 1}`}
                      onClick={() => setSelectedSpotIndex(idx)}
                      type="button"
                      className={`shrink-0 w-56 sm:w-64 p-3 rounded-lg text-left transition-all border flex flex-col justify-between group ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-900 text-neutral-50 shadow-md ring-1 ring-neutral-950'
                          : 'border-neutral-300 bg-neutral-100/70 text-neutral-900 hover:border-neutral-500 hover:bg-white'
                      }`}
                    >
                      {/* Thumbnail Container: Animated Video or CSS Placeholder */}
                      <div
                        className={`relative overflow-hidden rounded-md bg-neutral-900 cursor-pointer transition-all border mb-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-neutral-700'
                            : 'border-neutral-300 group-hover:border-neutral-500'
                        } ${
                          spot.aspectRatio === '9:16'
                            ? 'aspect-[9/16] w-full max-w-[140px] mx-auto'
                            : 'aspect-video w-full'
                        }`}
                      >
                        {spotVideoUrl ? (
                          <video
                            src={spotVideoUrl}
                            muted
                            loop
                            playsInline
                            ref={(el) => {
                              if (el) {
                                el.pause(); // Ensure inactive thumbnails do not play automatically
                                el.currentTime = 0;
                              }
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.play().catch(() => {});
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.pause();
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              isSelected ? 'bg-neutral-800' : 'bg-neutral-200'
                            }`}
                          >
                            <div className="font-mono text-[9px] uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                              <Play className="w-3 h-3" />
                              <span>SPOT 0{idx + 1}</span>
                            </div>
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1.5 px-1 bg-neutral-950/80 text-white font-mono text-[8px] rounded-xs uppercase z-10">
                          {spot.duration || '1:00'}
                        </span>
                      </div>

                      {/* Spot Meta */}
                      <div>
                        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider opacity-60 mb-1">
                          <span>SPOT 0{idx + 1}</span>
                          {spot.badge && <span>{spot.badge}</span>}
                        </div>
                        <div className="font-mono text-xs uppercase font-semibold leading-snug line-clamp-1">
                          {spot.title}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[9px] font-mono opacity-60 pt-2 border-t border-neutral-700/20">
                        <span>{spot.tag || 'MOTION CUT'}</span>
                        {isSelected ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Project Details / Metadata Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-neutral-100/70 border border-neutral-200 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                CLIENT / CONTEXT
              </span>
              <span className="font-medium text-neutral-900">{project.client}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                FORMAT / SIZE
              </span>
              <span className="font-medium text-neutral-900">
                {project.size?.toUpperCase() || 'STANDARD'}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                YEAR
              </span>
              <span className="font-medium text-neutral-900">{project.year}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 block mb-1">
                DISCIPLINE
              </span>
              <span className="font-medium text-neutral-900 line-clamp-1">
                {project.discipline}
              </span>
            </div>
          </div>

          {/* Markdown Body using react-markdown */}
          <div className="border-t border-neutral-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                TECHNICAL DOSSIER & CREATIVE DEBRIEF
              </div>
              {isAnthology && (
                <button
                  type="button"
                  onClick={() => setSelectedSpotIndex(-1)}
                  className={`font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    selectedSpotIndex === -1
                      ? 'text-neutral-950 font-bold underline'
                      : 'text-neutral-400 hover:text-neutral-900'
                  }`}
                >
                  [VIEW PARENT ANTHOLOGY OVERVIEW]
                </button>
              )}
            </div>
            <div className="markdown-body prose prose-neutral max-w-none text-neutral-800 font-sans leading-relaxed text-sm sm:text-base space-y-4">
              <Markdown>
                {selectedSpotIndex === -1 ? project.markdownContext : currentMarkdown}
              </Markdown>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-100/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            PROVENANCE // DUBAI & HYDERABAD ATELIER VERIFIED
          </div>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-md bg-neutral-950 text-neutral-50 font-mono text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
};
