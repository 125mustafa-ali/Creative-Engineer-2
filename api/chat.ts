import { GoogleGenAI } from '@google/genai';
import { fetchLiveStudioContext } from '../src/lib/sanityChatContext';
import { siteConfig, capabilities, portfolioWork } from '../src/data/data';

export default async function handler(req: any, res?: any) {
  // CORS Headers
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
  }

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      return res.status(200).end();
    }
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const sendResponse = (statusCode: number, data: any) => {
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
    return sendResponse(405, { error: 'Method Not Allowed. Please send a POST request.' });
  }

  try {
    // Parse body whether running in Node serverless or Web Request runtime
    let message: string | undefined;
    let history: any[] | undefined;

    if (typeof req.json === 'function' && (!req.body || typeof req.body.on !== 'function')) {
      try {
        const jsonBody = await req.json();
        message = jsonBody?.message;
        history = jsonBody?.history;
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
    }

    if (!message || typeof message !== 'string') {
      return sendResponse(400, { error: 'Valid message string is required.' });
    }

    // Fetch live unified Sanity context (Hero singleton, Capabilities, and Portfolio)
    const liveSanityData = await fetchLiveStudioContext();
    const stringifiedSanityData = JSON.stringify(liveSanityData);

    const systemInstruction = `You are the AI assistant for Mustafa's Creative Engineer portfolio (${siteConfig.siteTitle}).
Base all your answers strictly on this live JSON data: ${stringifiedSanityData}

ADDITIONAL METADATA:
- Contact Email: ${siteConfig.contactDetails.email}
- Studio Phone: ${siteConfig.contactDetails.phone}
- Studio Locations: ${siteConfig.studioNotice.location} (${siteConfig.studioNotice.coordinates})
- Availability Status: ${siteConfig.studioNotice.status}

GUIDELINES:
1. Grounding: Answer questions strictly based on the live studio data provided above.
2. If asked about something not mentioned in the portfolio, capabilities, or studio notice, politely and warmly state that it's not currently in the studio's records.
3. Tone: Warm, engaging, professional, articulate, and conversational.
4. Formatting: Keep responses concise, clear, and easy to read (1-3 short paragraphs or clean bullet points). Use Markdown when helpful.`;

    function getGroundedLocalResponse(queryStr: string): string {
      const query = queryStr.toLowerCase();
      let reply = '';
      if (
        query.includes('status') ||
        query.includes('available') ||
        query.includes('residency') ||
        query.includes('commission') ||
        query.includes('where') ||
        query.includes('location')
      ) {
        reply = `**Studio Availability & Location:**\n• Current Status: **${siteConfig.studioNotice.status}**\n• Atelier Locations: **${siteConfig.studioNotice.location}** (${siteConfig.studioNotice.coordinates})\n• Direct Inquiries: [${siteConfig.contactDetails.email}](mailto:${siteConfig.contactDetails.email}) or ${siteConfig.contactDetails.phone}`;
      } else if (
        query.includes('security') ||
        query.includes('n8n') ||
        query.includes('playbook') ||
        query.includes('fortinet')
      ) {
        const p =
          (liveSanityData.portfolio && liveSanityData.portfolio.length > 0
            ? liveSanityData.portfolio
            : portfolioWork
          ).find((w: any) => w.order === 1 || w.id === 1) || portfolioWork[0];
        reply = `**${p.title}** (${p.discipline}, ${p.year})\n\n• **Context:** ${p.client}\n• **Architecture:** Automated incident response pipeline built on n8n. Ingests webhook alerts, queries Fortinet firewall and Cisco ISE, evaluates IP reputational scoring, and coordinates isolation protocols in under 3 seconds.\n• **Tech Stack:** n8n, Fortinet, Cisco ISE, REST Webhooks`;
      } else if (
        query.includes('portfolio') ||
        query.includes('react') ||
        query.includes('next.js') ||
        query.includes('website')
      ) {
        const p =
          (liveSanityData.portfolio && liveSanityData.portfolio.length > 0
            ? liveSanityData.portfolio
            : portfolioWork
          ).find((w: any) => w.order === 2 || w.id === 2) || portfolioWork[1];
        reply = `**${p.title}** (${p.discipline}, ${p.year})\n\n• **Context:** ${p.client}\n• **Architecture:** Minimalist monochrome design language paired with pure CSS media placeholders, grounded Gemini conversational API proxy, and Sanity CMS isolated preview.\n• **Tech Stack:** React 19, Next.js, Vite, Tailwind CSS, Google Gemini`;
      } else if (
        query.includes('commercial') ||
        query.includes('storytelling') ||
        query.includes('campaign')
      ) {
        const p =
          (liveSanityData.portfolio && liveSanityData.portfolio.length > 0
            ? liveSanityData.portfolio
            : portfolioWork
          ).find((w: any) => w.order === 3 || w.id === 3) || portfolioWork[2];
        reply = `**${p.title}** (${p.discipline}, ${p.year})\n\nThis anthology features commercial spec campaign concepts exploring low-token pre-production, photorealistic action physics, and brand storytelling.`;
      } else if (
        query.includes('notebooklm') ||
        query.includes('ai content') ||
        query.includes('prompts')
      ) {
        const p =
          (liveSanityData.portfolio && liveSanityData.portfolio.length > 0
            ? liveSanityData.portfolio
            : portfolioWork
          ).find((w: any) => w.order === 4 || w.id === 4) || portfolioWork[3];
        reply = `**${p.title}** (${p.discipline}, ${p.year})\n\nAn 8-part anthology examining AI-assisted research and vertical short-form knowledge synthesis.`;
      } else if (
        query.includes('capabilit') ||
        query.includes('service') ||
        query.includes('skill') ||
        query.includes('what do you do') ||
        query.includes('expertise')
      ) {
        const caps =
          liveSanityData.capabilities && liveSanityData.capabilities.length > 0
            ? liveSanityData.capabilities
            : capabilities;
        reply =
          `**Core Studio Capabilities:**\n\n` +
          caps
            .map(
              (c: any) =>
                `• **${c.title}** [${c.category}]\n  ${c.description}\n  *Technologies & Tools:* ${(c.tags || []).join(', ')}`
            )
            .join('\n\n');
      } else if (
        query.includes('work') ||
        query.includes('project') ||
        query.includes('dossier')
      ) {
        const ports =
          liveSanityData.portfolio && liveSanityData.portfolio.length > 0
            ? liveSanityData.portfolio
            : portfolioWork;
        reply =
          `**Selected Portfolio Work:**\n\n` +
          ports
            .map(
              (p: any) =>
                `• **${p.title}** (${p.discipline}, ${p.year})\n  Client: ${p.client} | Format: ${p.size}`
            )
            .join('\n\n');
      } else if (
        query.includes('contact') ||
        query.includes('email') ||
        query.includes('phone') ||
        query.includes('reach')
      ) {
        reply = `**Direct Contact Channels:**\n• Email: [${siteConfig.contactDetails.email}](mailto:${siteConfig.contactDetails.email})\n• Studio Phone: ${siteConfig.contactDetails.phone}\n• Atelier: ${siteConfig.studioNotice.location}\n\nYou can also submit an inquiry using the **Let's Talk** interactive form below.`;
      } else {
        const heroHeading = liveSanityData.hero?.heading || siteConfig.heroStatement;
        reply = `Hi! Thanks for asking. Operating between ${siteConfig.studioNotice.location}, our current status is **${siteConfig.studioNotice.status}**.\n\n"${heroHeading}"\n\nFeel free to ask about our automation playbooks, web development, commercial motion anthologies, or AI research systems!`;
      }
      return reply;
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      // In case GEMINI_API_KEY is not yet populated on Vercel, serve grounded local response instead of 500
      console.warn('GEMINI_API_KEY missing in environment variables. Serving grounded local studio response.');
      const fallbackReply = getGroundedLocalResponse(message);
      return sendResponse(200, {
        reply: fallbackReply,
        note: 'Grounded response served from studio database. Set GEMINI_API_KEY in Vercel settings for full generative intelligence.',
      });
    }

    try {
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
          console.warn(`Model ${modelName} unavailable, attempting fallback:`, mErr?.message);
        }
      }

      if (!reply) {
        if (lastError) {
          console.warn(
            'All candidate models failed; serving verified grounded archive response:',
            lastError?.message
          );
        }
        reply = getGroundedLocalResponse(message);
      }

      return sendResponse(200, { reply });
    } catch (geminiErr: any) {
      console.error('Gemini API error in /api/chat:', geminiErr);
      // Fallback to grounded local response so the user interface never breaks
      const groundedReply = getGroundedLocalResponse(message);
      return sendResponse(200, { reply: groundedReply });
    }
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    return sendResponse(500, {
      error: 'Failed to process chat query.',
      details: err?.message || String(err),
    });
  }
}
