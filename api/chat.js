import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@sanity/client';

// 1. Initialize Read-Only Sanity Client
const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  'xml5x7xn';

const sanityDataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  'production';

const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: '2024-01-01',
  useCdn: false, // Always fetch live un-cached studio data
});

/**
 * Fetch fresh portfolio & studio context directly from Sanity CMS
 */
async function fetchSanityPortfolioContext() {
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
    const data = await sanityClient.fetch(query);
    return data || {};
  } catch (error) {
    console.error('Error querying Sanity portfolio context for AI grounding:', error);
    return {};
  }
}

/**
 * Build grounded system instruction incorporating live Sanity data
 */
function buildSystemInstruction(sanityContext) {
  const contextString = JSON.stringify(sanityContext, null, 2);

  return `You are Mustafa's official AI assistant for his Creative Engineering portfolio website.
Your role is to help visitors, prospective clients, and collaborators explore Mustafa's background, technical capabilities, projects, and availability.

LIVE PORTFOLIO CONTEXT FROM SANITY CMS:
----------------------------------------
${contextString}
----------------------------------------

STUDIO DETAILS:
- Name / Practice: Mustafa — Creative Engineer
- Key Disciplines: Smart Workflow Automation (n8n, Webhooks, APIs), Modern Web Architecture (React, TypeScript, Next.js, Vite, Tailwind CSS), AI Systems & Data Structuring, and Motion / Visual Storytelling.
- Locations: Dubai and Hyderabad
- Current Availability: Accepting select projects for Q3/Q4 2026
- Direct Contact Email: 125.mustafa@gmail.com
- Direct Contact Phone: +971 545648341

GUIDELINES:
1. Always base your answers strictly and accurately on the live Sanity portfolio data and studio details above.
2. Provide clear, direct, and well-structured responses. Use clean spacing and bullet points where helpful.
3. If asked about something outside Mustafa's portfolio or capabilities, politely mention that it is not in the studio's records and suggest contacting Mustafa directly at 125.mustafa@gmail.com.
4. Keep the tone warm, professional, articulate, and welcoming.`;
}

/**
 * Serverless / Express API route handler
 */
export default async function handler(req, res) {
  // CORS Headers
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
  }

  // Preflight OPTIONS handling
  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      return res.status(200).end();
    }
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const sendResponse = (statusCode, data) => {
    if (res && typeof res.status === 'function') {
      return res.status(statusCode).json(data);
    }
    return new Response(JSON.stringify(data), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  };

  if (req.method !== 'POST') {
    return sendResponse(405, { error: 'Method Not Allowed. POST required.' });
  }

  try {
    // Parse request body
    let body = req.body;
    if (typeof req.json === 'function' && (!req.body || typeof req.body.on !== 'function')) {
      try {
        body = await req.json();
      } catch (_) {}
    } else if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {}
    }

    const message = body?.message;
    const history = body?.history;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return sendResponse(400, { error: 'A valid message string is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return sendResponse(500, {
        error: 'GEMINI_API_KEY is not configured on the server.',
        success: false,
      });
    }

    // 1. Fetch live Sanity CMS data
    const sanityContext = await fetchSanityPortfolioContext();

    // 2. Build system prompt
    const systemInstruction = buildSystemInstruction(sanityContext);

    // 3. Initialize GoogleGenAI SDK
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // 4. Build multi-turn contents array
    const conversationContents = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-10)) {
        if (item && item.content && typeof item.content === 'string') {
          conversationContents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        }
      }
    }

    conversationContents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    // 5. Generate content with strict structured JSON output
    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError = null;
    let replyText = '';

    for (const model of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: conversationContents,
            config: {
              systemInstruction,
              temperature: 0.4,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reply: {
                    type: Type.STRING,
                    description: 'The response answering the user query grounded in portfolio context.',
                  },
                },
                required: ['reply'],
              },
            },
          });

          const rawText = response.text || '';
          try {
            const parsed = JSON.parse(rawText);
            replyText = parsed.reply || rawText;
          } catch (_) {
            replyText = rawText;
          }

          if (replyText) {
            lastError = null;
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Model ${model} attempt ${attempt + 1} error:`, err?.message || err);
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 900));
          }
        }
      }
      if (replyText) break;
    }

    if (lastError && !replyText) {
      const is503 =
        lastError?.status === 503 ||
        lastError?.message?.includes('503') ||
        lastError?.message?.includes('high demand') ||
        lastError?.message?.includes('UNAVAILABLE');

      return sendResponse(is503 ? 503 : 500, {
        error: lastError?.message || 'Gemini API temporary error.',
        success: false,
      });
    }

    return sendResponse(200, {
      reply: replyText,
      success: true,
    });
  } catch (err) {
    console.error('Unhandled error in /api/chat handler:', err);
    return sendResponse(500, {
      error: err?.message || 'Server error processing chat request.',
      success: false,
    });
  }
}
