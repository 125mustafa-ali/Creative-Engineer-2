import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@sanity/client';

// Direct initialization of Sanity client using process.env variables (with fallbacks)
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
  useCdn: false, // Ensure fresh, un-cached portfolio data for AI grounding
});

/**
 * Fetch unified portfolio context directly from Sanity CMS
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
    console.error('Error fetching live portfolio context from Sanity:', error);
    return {};
  }
}

/**
 * Build grounded system instructions injecting the Sanity CMS context and specific chatbot role
 */
function buildSystemInstruction(sanityContext, role = 'general') {
  const contextString = JSON.stringify(sanityContext, null, 2);

  let rolePersona = '';
  switch (role) {
    case 'complex':
    case 'technical-architect':
      rolePersona = `ROLE: Gemini Senior Technical Architect & Systems Engineer.
You specialize in deep technical queries: automated incident pipelines (n8n, Webhooks, Fortinet, Cisco ISE), cloud & network infrastructure, React/TypeScript architecture, and AI-driven content systems.
Provide rigorous, technically precise, and detailed architectural breakdowns.`;
      break;

    case 'fast':
    case 'fast-concierge':
      rolePersona = `ROLE: Gemini Fast Studio Concierge.
Provide rapid, ultra-concise, and crisp responses. Focus on immediate clarity regarding studio availability (Q3/Q4 2026), studio locations (Dubai & Hyderabad), booking timeline, and direct contacts (125.mustafa@gmail.com, +971 545648341). Use brief bullet points.`;
      break;

    case 'general':
    case 'studio-guide':
    default:
      rolePersona = `ROLE: Gemini Studio Ambassador & Portfolio Guide.
Your role is to help visitors, prospective clients, and collaborators explore Mustafa's creative engineering practice, featured case studies, multidisciplinary philosophy, and capabilities.`;
      break;
  }

  return `${rolePersona}

You are the official grounded Gemini chatbot for Mustafa's Creative Engineer portfolio.

LIVE PORTFOLIO CONTEXT FROM SANITY CMS:
---
${contextString}
---

STUDIO INFORMATION:
- Practice: Creative Engineering (Mustafa)
- Focus: Bridging emergent technology and human storytelling. Building automated incident pipelines (n8n, Webhooks, Fortinet, Cisco ISE), high-performance digital platforms (React, Next.js, Vite, Tailwind CSS), AI-driven systems (NotebookLM, Prompt Engineering), and commercial visual & motion storytelling.
- Atelier Locations: Dubai and Hyderabad
- Current Status: Accepting select projects — Q3/Q4 2026
- Direct Contact: 125.mustafa@gmail.com
- Studio Phone: +971 545648341

GUIDELINES:
1. Grounding: Answer strictly and faithfully based on the live Sanity portfolio data and studio details above.
2. If asked about specific projects (e.g., Security Automation Playbook, Interactive React Portfolio, Commercial Storytelling Concepts, AI Content Systems), provide accurate descriptions from the portfolio context.
3. If asked about something outside the recorded portfolio, capabilities, or studio notice, politely and warmly state that it is not currently in the studio's records, and suggest contacting Mustafa directly via email (125.mustafa@gmail.com) or the "Let's Talk" form.
4. Tone: Warm, articulate, professional, confident, and conversational.
5. Multi-turn dialogue: Maintain clear context across multiple turns of the conversation.
6. Formatting: Use clean Markdown formatting when helpful.`;
}

/**
 * Serverless API handler compatible with Vercel, Express, and standard Web runtimes
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

  // Helper to send JSON responses across Node.js / Express and Web environments
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
    return sendResponse(405, { error: 'Method Not Allowed. Expected a POST request.' });
  }

  try {
    // Parse incoming request body
    let message;
    let history;
    let role = 'studio-guide';
    let requestedModel;
    let taskType;

    if (typeof req.json === 'function' && (!req.body || typeof req.body.on !== 'function')) {
      try {
        const jsonBody = await req.json();
        message = jsonBody?.message;
        history = jsonBody?.history;
        role = jsonBody?.role || 'studio-guide';
        requestedModel = jsonBody?.model;
        taskType = jsonBody?.taskType;
      } catch (_) {}
    } else {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {}
      }
      message = body?.message;
      history = body?.history;
      role = body?.role || 'studio-guide';
      requestedModel = body?.model;
      taskType = body?.taskType;
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return sendResponse(400, { error: 'Valid message string is required.' });
    }

    // Verify GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return sendResponse(500, {
        error: 'GEMINI_API_KEY environment variable is missing or not configured.',
        success: false,
      });
    }

    // 1. Fetch live portfolio context directly from Sanity CMS
    const sanityContext = await fetchSanityPortfolioContext();

    // 2. Inject context and role into system instructions
    const systemInstruction = buildSystemInstruction(sanityContext, role);

    // 3. Initialize Google Gen AI SDK correctly with GEMINI_API_KEY
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // 4. Build multi-turn conversation contents
    const conversationContents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-12)) {
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

    // 5. Select Gemini model based on user intent and task complexity:
    // - gemini-3.1-pro-preview for particularly complex tasks
    // - gemini-3.5-flash for general tasks
    // - gemini-3.1-flash-lite for tasks that should happen fast
    let model = 'gemini-3.5-flash';
    if (requestedModel) {
      model = requestedModel;
    } else if (taskType === 'complex' || role === 'technical-architect' || role === 'complex') {
      model = 'gemini-3.1-pro-preview';
    } else if (taskType === 'fast' || role === 'fast-concierge' || role === 'fast') {
      model = 'gemini-3.1-flash-lite';
    } else {
      model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    }

    const response = await ai.models.generateContent({
      model,
      contents: conversationContents,
      config: {
        systemInstruction,
        temperature: role === 'technical-architect' || taskType === 'complex' ? 0.2 : 0.4,
      },
    });

    const reply = response.text || '';

    return sendResponse(200, {
      reply,
      modelUsed: model,
      roleUsed: role,
      success: true,
    });
  } catch (err) {
    // Surface real API failures directly (such as 429 quota limits, auth errors, etc.)
    console.error('Gemini API Error in /api/chat:', err);

    let errorDetail = err?.message || 'Error processing chat query with Gemini API.';
    let statusCode = err?.status || 500;

    try {
      const parsed = JSON.parse(errorDetail);
      if (parsed?.error?.message) {
        errorDetail = parsed.error.message;
      }
      if (parsed?.error?.code && typeof parsed.error.code === 'number') {
        statusCode = parsed.error.code;
      }
    } catch (_) {}

    return sendResponse(statusCode, {
      error: errorDetail,
      code: statusCode,
      success: false,
    });
  }
}
