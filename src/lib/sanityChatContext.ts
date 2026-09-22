import { createClient } from '@sanity/client';

// 1. Initialize Read-Only Sanity Client
export const client = createClient({
  projectId: 'xml5x7xn',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // Ensure the AI always gets the freshest un-cached data
});

export interface LiveSanityPayload {
  hero: any;
  capabilities: any[];
  portfolio: any[];
}

export async function fetchLiveStudioContext(): Promise<LiveSanityPayload> {
  // 2. Construct a Unified GROQ Query
  // Fetching the Hero singleton, Capabilities, and Portfolio Items simultaneously
  const query = `{
    "hero": *[_id == "hero-singleton"][0],
    "capabilities": *[_type == "capability"] | order(_createdAt asc),
    "portfolio": *[_type == "portfolioItem"] | order(order asc) {
      ...,
      context,
      markdownContext,
      "spots": coalesce(spots, anthologySpots, anthology, anthologyItems, items)[] {
        ...,
        context,
        markdownContext
      }
    }
  }`;

  // 3. Fetch & Serialize with Fallback Mandate
  try {
    const data = await client.fetch<LiveSanityPayload>(query);
    return data || { hero: null, capabilities: [], portfolio: [] };
  } catch (fetchError) {
    console.error('Sanity fetch failed, AI may lack context:', fetchError);
    // Fallback Mandate: Provide a minimal safe object if Sanity is down
    return { hero: null, capabilities: [], portfolio: [] };
  }
}
