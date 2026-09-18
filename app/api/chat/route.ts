import { GoogleGenAI } from '@google/genai';
import { siteConfig, capabilities, portfolioWork } from '../../../src/data/data';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return Response.json(
        { error: 'Valid message string is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    const studioKnowledgeBase = JSON.stringify(
      {
        siteConfig,
        capabilities,
        portfolioWork,
      },
      null,
      2
    );

    const systemInstruction = `You are the friendly, helpful AI Assistant for ${siteConfig.siteTitle} (${siteConfig.siteSubtitle}).
Your objective is to answer visitor questions accurately, warmly, and helpfully based on the studio's single source of truth data provided below.

=== STUDIO ARCHIVE DATA PAYLOAD ===
${studioKnowledgeBase}
=== END OF STUDIO ARCHIVE DATA ===

GUIDELINES:
1. Grounding: Answer questions strictly based on the studio data provided above (capabilities, projects, background, contact details, status).
2. If asked about something not mentioned in the portfolio, client list, capabilities, or studio notice, politely and warmly state that it's not currently in the studio's portfolio records.
3. Tone: Warm, engaging, professional, articulate, and conversational.
4. Formatting: Keep responses concise, clear, and easy to read (1-3 short paragraphs or clean bullet points). Use Markdown when helpful.`;

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'API Key missing. Please add GEMINI_API_KEY to your environment variables.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const conversationContents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        conversationContents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.content }],
        });
      }
    }
    conversationContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let reply = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: conversationContents,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });
        if (response?.text) {
          reply = response.text;
          break;
        }
      } catch (mErr: any) {
        lastError = mErr;
        console.warn(`Model ${modelName} unavailable in route.ts:`, mErr?.message);
      }
    }

    if (!reply) {
      reply = `Thank you for asking! ${siteConfig.siteTitle} is currently ${siteConfig.studioNotice.status} based in ${siteConfig.studioNotice.location}. Explore our selected works and core capabilities above or contact us directly at ${siteConfig.contactDetails.email}.`;
    }

    return Response.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return Response.json(
      { error: 'Failed to process chat query.', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
