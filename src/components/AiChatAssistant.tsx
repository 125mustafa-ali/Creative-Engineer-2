import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { X, Send, RotateCcw, Bot, Zap, Cpu, Compass, Sparkles, AlertCircle } from 'lucide-react';
import { siteConfig } from '../data/data.ts';

export type ChatbotRole = 'studio-guide' | 'technical-architect' | 'fast-concierge';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  timestamp?: string;
}

export interface GeminiChatboxProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface RoleConfig {
  id: ChatbotRole;
  name: string;
  taskLabel: string;
  model: 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  welcomeMessage: string;
  suggestedQueries: string[];
}

const ROLES: Record<ChatbotRole, RoleConfig> = {
  'studio-guide': {
    id: 'studio-guide',
    name: 'Studio Guide',
    taskLabel: 'General Tasks',
    model: 'gemini-3.5-flash',
    icon: Compass,
    description: 'Explores portfolio works, design philosophy, and capabilities',
    welcomeMessage: `Hello! I am your **Gemini Studio Guide** (powered by **gemini-3.5-flash**).

I'm grounded directly in Mustafa's portfolio archive and live studio knowledge base. How can I help you explore our creative engineering work today?`,
    suggestedQueries: [
      'What are Mustafa’s core capabilities?',
      'Tell me about the Security Automation Playbook.',
      'What commercial storytelling projects exist?',
      'Are you taking on new client projects?',
    ],
  },
  'technical-architect': {
    id: 'technical-architect',
    name: 'Tech Architect',
    taskLabel: 'Complex Tasks',
    model: 'gemini-3.1-pro-preview',
    icon: Cpu,
    description: 'Deep technical analysis: n8n, Cisco ISE, Fortinet APIs, & React',
    welcomeMessage: `Welcome to the **Gemini Technical Architect** console (powered by **gemini-3.1-pro-preview** for complex reasoning).

I specialize in architectural breakdowns of security automation pipelines, webhook triaging, network integrations (Cisco ISE, Fortinet), and high-performance React/Tailwind frontend systems. What technical challenge would you like to explore?`,
    suggestedQueries: [
      'Break down the n8n Cisco ISE webhook architecture.',
      'How are security incident pipelines automated?',
      'Explain the React 19 and Tailwind architecture here.',
      'How does the Sanity CMS and Gemini grounding work?',
    ],
  },
  'fast-concierge': {
    id: 'fast-concierge',
    name: 'Fast Concierge',
    taskLabel: 'Fast Tasks',
    model: 'gemini-3.1-flash-lite',
    icon: Zap,
    description: 'Rapid, concise Q&A on booking, status, and studio location',
    welcomeMessage: `**Gemini Fast Concierge** ready (powered by **gemini-3.1-flash-lite** for near-instant responses).

Ask me anything for immediate, concise answers regarding availability, atelier locations, and contact details.`,
    suggestedQueries: [
      'What is current project availability?',
      'Where are the studio ateliers located?',
      'How do I contact Mustafa directly?',
      'What is the studio phone number?',
    ],
  },
};

export const GeminiChatbox: React.FC<GeminiChatboxProps> = ({
  isOpen,
  onToggle,
}) => {
  const [activeRole, setActiveRole] = useState<ChatbotRole>('studio-guide');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      role: 'assistant',
      content: ROLES['studio-guide'].welcomeMessage,
      modelUsed: ROLES['studio-guide'].model,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentRoleConfig = ROLES[activeRole];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  // Handle switching roles and appending system transition announcement
  const handleRoleChange = (newRole: ChatbotRole) => {
    if (newRole === activeRole) return;
    setActiveRole(newRole);

    const newConfig = ROLES[newRole];
    setMessages((prev) => [
      ...prev,
      {
        id: `role-switch-${Date.now()}`,
        role: 'assistant',
        content: `*Switched role to **${newConfig.name}** (${newConfig.taskLabel} • Model: \`${newConfig.model}\`)*\n\n${newConfig.welcomeMessage}`,
        modelUsed: newConfig.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history excluding initial greeting or notices
      const payloadHistory = messages
        .filter((m) => !m.id.startsWith('role-switch-') && !m.id.startsWith('err-'))
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: payloadHistory,
          role: activeRole,
          model: currentRoleConfig.model,
          taskType:
            activeRole === 'technical-architect'
              ? 'complex'
              : activeRole === 'fast-concierge'
              ? 'fast'
              : 'general',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Gemini API server error (${res.status})`);
      }

      const data = await res.json();
      if (!data.reply) {
        throw new Error('No response text received from Gemini model.');
      }

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        modelUsed: data.modelUsed || currentRoleConfig.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        'Unable to connect to the Gemini API right now. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${errorMessage}`,
          modelUsed: currentRoleConfig.model,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: currentRoleConfig.welcomeMessage,
        modelUsed: currentRoleConfig.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div id="gemini-chatbot-container" className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={onToggle}
          id="gemini-chatbot-floating-button"
          type="button"
          className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-neutral-950 text-neutral-50 shadow-2xl hover:bg-neutral-800 transition-all duration-300 border border-neutral-800 hover:scale-105 active:scale-95 cursor-pointer font-sans text-xs sm:text-sm font-medium tracking-wide"
          aria-label="Open Ask AI"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>Ask AI</span>
        </button>
      ) : (
        <div
          id="gemini-chatbot-window"
          className="w-[92vw] sm:w-[440px] md:w-[480px] h-[580px] max-h-[88vh] bg-neutral-50 border border-neutral-300 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 text-neutral-50 shrink-0 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-xs font-semibold text-white">
                    Ask AI
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {currentRoleConfig.model}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Multi-Turn Grounded AI • {currentRoleConfig.taskLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                type="button"
                id="gemini-chatbot-reset-btn"
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Reset conversation history"
                aria-label="Reset conversation history"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggle}
                id="gemini-chatbot-close-btn"
                type="button"
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Close Ask AI window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role & Model Selector Pill Strip */}
          <div className="px-3 py-2 bg-neutral-100 border-b border-neutral-200 shrink-0">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">
                Chatbot Persona & Gemini Model
              </span>
              <span className="font-mono text-[9px] text-neutral-400">
                {currentRoleConfig.description}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5" role="tablist" aria-label="Chatbot Role Selection">
              {(Object.keys(ROLES) as ChatbotRole[]).map((roleKey) => {
                const role = ROLES[roleKey];
                const Icon = role.icon;
                const isActive = activeRole === roleKey;
                return (
                  <button
                    key={role.id}
                    id={`chatbot-role-tab-${role.id}`}
                    type="button"
                    onClick={() => handleRoleChange(roleKey)}
                    className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-sans transition-all text-left ${
                      isActive
                        ? 'bg-neutral-950 text-neutral-50 font-medium shadow-xs border border-neutral-900'
                        : 'bg-white text-neutral-700 hover:bg-neutral-200/80 border border-neutral-300'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    <span className="truncate">{role.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Suggested Query Chips */}
          <div className="px-3 py-1.5 bg-neutral-50 border-b border-neutral-200/70 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
            {currentRoleConfig.suggestedQueries.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                type="button"
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono text-neutral-700 bg-white border border-neutral-300 hover:border-neutral-900 hover:text-neutral-950 transition-colors shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Scrollable Thread */}
          <div
            id="gemini-chatbot-messages-thread"
            className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs sm:text-sm"
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isError = msg.id.startsWith('err-');
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                      {isUser ? 'YOU' : isError ? 'NOTICE' : 'ASK AI'}
                    </span>
                    {!isUser && msg.modelUsed && !isError && (
                      <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-neutral-200 text-neutral-600">
                        {msg.modelUsed}
                      </span>
                    )}
                    {msg.timestamp && (
                      <span className="font-mono text-[9px] text-neutral-400">
                        {msg.timestamp}
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-lg max-w-[92%] leading-relaxed ${
                      isUser
                        ? 'bg-neutral-950 text-neutral-50 rounded-br-none shadow-xs'
                        : isError
                        ? 'bg-amber-50 text-amber-950 border border-amber-300/80 rounded-bl-none flex items-start gap-2'
                        : 'bg-neutral-200/60 text-neutral-900 border border-neutral-300/80 rounded-bl-none'
                    }`}
                  >
                    {isError && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm prose-invert prose-headings:text-base prose-headings:font-bold prose-p:leading-snug max-w-none">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                    ASK AI
                  </span>
                  <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-neutral-200 text-neutral-600">
                    {currentRoleConfig.model}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-200/60 text-neutral-700 border border-neutral-300/80 rounded-bl-none flex items-center gap-2 font-mono text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-800 animate-spin" />
                  <span>Gemini is generating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Multi-turn Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              id="gemini-chatbot-input-field"
              type="text"
              placeholder={`Ask the ${currentRoleConfig.name} (${currentRoleConfig.model})...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-md border border-neutral-300 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 font-sans text-xs focus:outline-hidden focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 disabled:opacity-50"
            />
            <button
              id="gemini-chatbot-send-btn"
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-md bg-neutral-950 text-neutral-50 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-950 transition-colors shrink-0 cursor-pointer"
              aria-label="Send message to Ask AI"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Backwards compatibility alias
export const AiChatAssistant = GeminiChatbox;
