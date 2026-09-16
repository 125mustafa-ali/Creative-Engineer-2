import React, { useState, useEffect } from 'react';
import { client, capabilities as localCapabilities } from '../data/data.ts';
import { Layers } from 'lucide-react';

interface CapabilityItem {
  _id?: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
}

export const CapabilitiesSection: React.FC = () => {
  const [capabilitiesData, setCapabilitiesData] = useState<CapabilityItem[]>(localCapabilities);

  useEffect(() => {
    let isMounted = true;
    async function fetchCapabilities() {
      // Precise GROQ Query with ordering
      const query = '*[_type == "capability"] | order(_createdAt asc)';
      try {
        const fetchedCapabilities = await client.fetch<CapabilityItem[]>(query);
        if (isMounted && Array.isArray(fetchedCapabilities) && fetchedCapabilities.length > 0) {
          // Filter to items that have valid categories or valid entries, and use them
          const validData = fetchedCapabilities.filter((item) => item.title && item.category);
          if (validData.length > 0) {
            setCapabilitiesData(validData);
          } else {
            setCapabilitiesData(fetchedCapabilities);
          }
        }
      } catch (error) {
        console.error('Failed to fetch capabilities from Sanity, falling back to local data:', error);
      }
    }

    fetchCapabilities();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="capabilities"
      className="py-20 border-b border-neutral-200 relative"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
            <Layers className="w-3 h-3 text-neutral-700" />
            <span>SECTION 02 // COMPETENCY INDEX</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-neutral-950 uppercase tracking-tight font-normal">
            CORE CAPABILITIES
          </h2>
        </div>
        <p className="font-sans text-xs sm:text-sm text-neutral-600 max-w-md font-light leading-relaxed">
          Custom digital platforms, autonomous task orchestration, and high-impact visual storytelling engineered for speed and clarity.
        </p>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {capabilitiesData.map((item, index) => (
          <div
            key={item._id || item.title || index}
            id={`capability-card-${index + 1}`}
            className="p-8 rounded-lg border border-neutral-200/90 bg-neutral-50/50 hover:bg-white hover:border-neutral-400/80 transition-all duration-300 flex flex-col justify-between group shadow-2xs"
          >
            <div>
              {/* Category & Index Meta */}
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-4 pb-3 border-b border-neutral-200">
                <span className="text-sm font-semibold uppercase tracking-wider">{item.category}</span>
                <span className="text-neutral-400 group-hover:text-neutral-900 transition-colors">
                  [0{index + 1}]
                </span>
              </div>

              {/* Title in Uppercase */}
              <h3 className="font-serif text-xl sm:text-2xl text-neutral-950 uppercase tracking-tight mb-3 group-hover:translate-x-0.5 transition-transform">
                {item.title}
              </h3>

              {/* Description */}
              <p className="font-sans text-sm text-neutral-600 leading-relaxed font-light mb-6">
                {item.description}
              </p>
            </div>

            {/* Outlined Tag Pills */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-100">
              {item.tags?.map((tag, tagIdx) => (
                <span
                  key={`${tag}-${tagIdx}`}
                  className="border border-neutral-300/80 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-full text-neutral-800 bg-neutral-100/60 group-hover:border-neutral-400 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CapabilitiesSection;
