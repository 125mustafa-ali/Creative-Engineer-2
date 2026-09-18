/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from './components/Navigation.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { CapabilitiesSection } from './components/CapabilitiesSection.tsx';
import { WorkSection } from './components/WorkSection.tsx';
import { ProjectModal } from './components/ProjectModal.tsx';
import { ContactForm } from './components/ContactForm.tsx';
import { Footer } from './components/Footer.tsx';
import { GeminiChatbox } from './components/GeminiChatbox.tsx';
import { StudioCMSModal } from './components/StudioCMSModal.tsx';
import type { PortfolioItem } from './types.ts';
import StudioPage from '../app/studio/[[...tool]]/page.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isCmsModalOpen, setIsCmsModalOpen] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (currentPath.startsWith('/studio')) {
    return (
      <div className="w-screen h-screen min-h-screen bg-white">
        <StudioPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950 flex flex-col selection:bg-neutral-900 selection:text-neutral-50">
      {/* Temporary CMS Login Button */}
      <Link
        href="/studio"
        className="fixed top-4 right-4 z-50 bg-white text-black px-4 py-2 rounded-md text-sm font-bold border border-neutral-200 shadow-sm hover:bg-neutral-100 transition-colors"
        onClick={() => {
          setCurrentPath('/studio');
          window.history.pushState({}, '', '/studio');
        }}
      >
        CMS Login
      </Link>

      {/* Top Sticky Navigation */}
      <Navigation
        onOpenStudio={() => setIsCmsModalOpen(true)}
      />

      {/* Main Content Container with Horizontal Padding */}
      <main className="max-w-6xl mx-auto px-6 w-full flex-1">
        {/* Phase 4.1: Hero & Studio Notice */}
        <HeroSection onOpenAiChat={() => setIsAiChatOpen(true)} />

        {/* Phase 4.2: Capabilities */}
        <CapabilitiesSection />

        {/* Phase 4.3: Selected Work */}
        <WorkSection onSelectProject={(project) => setSelectedProject(project)} />

        {/* Phase 4.4: Let's Talk Form */}
        <ContactForm />

        {/* Phase 4.5: Footer */}
        <Footer />
      </main>

      {/* Work Dossier Overlay Modal */}
      <ProjectModal
        isOpen={selectedProject !== null}
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Multi-Turn Gemini Chatbot */}
      <GeminiChatbox
        isOpen={isAiChatOpen}
        onToggle={() => setIsAiChatOpen(!isAiChatOpen)}
      />

      {/* Isolated Sanity Studio Architecture Modal */}
      <StudioCMSModal
        isOpen={isCmsModalOpen}
        onClose={() => setIsCmsModalOpen(false)}
      />
    </div>
  );
}

