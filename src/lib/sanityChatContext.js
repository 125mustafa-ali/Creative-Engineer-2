import { createClient } from "@sanity/client";
const client = createClient({
  projectId: "xml5x7xn",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false
  // Ensure the AI always gets the freshest un-cached data
});
async function fetchLiveStudioContext() {
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
  try {
    const data = await client.fetch(query);
    return data || { hero: null, capabilities: [], portfolio: [] };
  } catch (fetchError) {
    console.error("Sanity fetch failed, AI may lack context:", fetchError);
    return { hero: null, capabilities: [], portfolio: [] };
  }
}
export {
  client,
  fetchLiveStudioContext
};
