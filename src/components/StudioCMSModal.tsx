import React from 'react';
import { X, ShieldCheck, Database, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { portfolioWork, capabilities } from '../data/data.ts';

interface StudioCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudioCMSModal: React.FC<StudioCMSModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="sanity-studio-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="sanity-studio-modal"
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 font-mono text-xs"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold tracking-wider uppercase text-white">
              SANITY CMS ISOLATION LAYER
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Isolation Status */}
        <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>ISOLATION RULE ENFORCED</span>
          </div>
          <p className="text-neutral-300 font-sans text-xs leading-relaxed">
            Sanity is isolated at{' '}
            <code className="text-emerald-300 bg-neutral-900 px-1 py-0.5 rounded">
              app/(studio)/studio/[[...tool]]
            </code>
            . It does NOT import global CSS, headers, or smooth-scroll logic,
            ensuring zero interference with the high-performance portfolio
            runtime.
          </p>
        </div>

        {/* Data Layer Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/60 space-y-2">
            <div className="flex items-center gap-2 text-neutral-400 text-[10px] uppercase tracking-widest">
              <Database className="w-3.5 h-3.5 text-neutral-300" />
              <span>SINGLE SOURCE OF TRUTH</span>
            </div>
            <div className="text-neutral-200 text-sm font-semibold">
              src/data/data.ts
            </div>
            <p className="text-neutral-400 font-sans text-[11px]">
              Active fallback source with {portfolioWork.length} portfolio dossiers and {capabilities.length} capabilities.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/60 space-y-2">
            <div className="flex items-center gap-2 text-neutral-400 text-[10px] uppercase tracking-widest">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>FALLBACK HOOKUP</span>
            </div>
            <div className="text-neutral-200 text-sm font-semibold">
              fetchPortfolioWork()
            </div>
            <p className="text-neutral-400 font-sans text-[11px]">
              Safely queries CMS if configured, otherwise serves local typed records with zero downtime.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-neutral-800 text-[10px] text-neutral-500">
          <span>MONOCHROME ARCHIVE ARCHITECTURE</span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded bg-neutral-100 text-neutral-950 font-semibold hover:bg-white transition-colors"
          >
            Return to Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};
