import { fetchLiveStudioContext } from '../../../lib/sanityChatContext.ts';

/**
 * Next.js App Router compatible POST handler for chat context resolution.
 */
export async function POST(req: Request) {
  try {
    const { messages, message } = await req.json();

    // 2 & 3. Construct Unified GROQ Query, Fetch & Serialize
    const sanityData = await fetchLiveStudioContext();
    const stringifiedSanityData = JSON.stringify(sanityData);

    // 4. Inject into System Prompt
    const systemInstruction = `You are the AI assistant for Mustafa's Creative Engineer portfolio. Base all your answers strictly on this live JSON data: ${stringifiedSanityData}`;

    return new Response(
      JSON.stringify({
        success: true,
        systemInstruction,
        data: sanityData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
