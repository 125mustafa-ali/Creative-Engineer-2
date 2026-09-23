import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { X, Send, RotateCcw, Bot, Sparkles, AlertCircle } from 'lucide-react';

export type ChatbotRole = 'studio-guide' | string;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface GeminiChatboxProps {
  isOpen: boolean;
  onToggle: () => void;
}

const INITIAL_GREETING =
  'Hi there! I’m Mustafa’s AI assistant, grounded directly in his portfolio and studio data. How can I help you explore his work today?';

const SUGGESTED_QUERIES = [
  'What are Mustafa’s core capabilities?',
  'Tell me about the Security Automation Playbook.',
  'What commercial storytelling projects exist?',
  'Are you accepting new client projects?',
];

export const GeminiChatbox: React.FC<GeminiChatboxProps> = ({
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      role: 'assistant',
      content: INITIAL_GREETING,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

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
      // Build conversation history excluding initial greeting or error banners
      const payloadHistory = messages
        .filter((m) => !m.id.startsWith('err-') && m.id !== 'msg-init')
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
          role: 'studio-guide',
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
        content: INITIAL_GREETING,
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
          className="w-[92vw] sm:w-[440px] md:w-[480px] h-[560px] max-h-[88vh] bg-neutral-50 border border-neutral-300 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Clean, Minimal Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 text-neutral-50 shrink-0 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans text-xs font-semibold text-white leading-tight">
                  Ask AI
                </h3>
                <p className="text-[10px] text-neutral-400 flex items-center gap-1.5 leading-tight mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Grounded in Studio Data</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                type="button"
                id="gemini-chatbot-reset-btn"
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Reset conversation"
                aria-label="Reset conversation"
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

          {/* Suggested Starter Query Chips (Visible on fresh thread) */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 bg-neutral-100 border-b border-neutral-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
              {SUGGESTED_QUERIES.map((q) => (
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
          )}

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
                      {isUser ? 'YOU' : isError ? 'NOTICE' : 'AI ASSISTANT'}
                    </span>
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
                    AI ASSISTANT
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-200/60 text-neutral-700 border border-neutral-300/80 rounded-bl-none flex items-center gap-2 font-mono text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-800 animate-spin" />
                  <span>Generating response...</span>
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
              placeholder="Ask about projects, capabilities, or availability..."
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
