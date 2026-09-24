/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { CapabilitiesSection } from './components/CapabilitiesSection.tsx';
import { WorkSection } from './components/WorkSection.tsx';
import { ProjectModal } from './components/ProjectModal.tsx';
import { ContactForm } from './components/ContactForm.tsx';
import { Footer } from './components/Footer.tsx';
import { StudioCMSModal } from './components/StudioCMSModal.tsx';
import { AiChatAssistant } from './components/AiChatAssistant.tsx';
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
  const [isCmsModalOpen, setIsCmsModalOpen] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      window.dispatchEvent(new CustomEvent('sanity:refresh'));
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
      {/* Top Sticky Navigation */}
      <Navigation
        onOpenStudio={() => setIsCmsModalOpen(true)}
      />

      {/* Main Content Container with Horizontal Padding */}
      <main className="max-w-6xl mx-auto px-6 w-full flex-1">
        {/* Phase 4.1: Hero & Studio Notice */}
        <HeroSection />

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

      {/* Isolated Sanity Studio Architecture Modal */}
      <StudioCMSModal
        isOpen={isCmsModalOpen}
        onClose={() => setIsCmsModalOpen(false)}
      />

      {/* Grounded Gemini AI Assistant Widget */}
      <AiChatAssistant />
    </div>
  );
}

