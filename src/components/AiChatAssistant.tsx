import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { X, Send, RotateCcw } from 'lucide-react';
import { siteConfig } from '../data/data.ts';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'msg-init',
  role: 'assistant',
  content: `Hi there! 👋 Welcome to ${siteConfig.siteTitle}.

I'm an AI assistant trained directly on our studio's portfolio, background, and capabilities. Feel free to ask me anything about our recent projects, technical expertise in modern web and security automation, or availability for collaborations.

How can I help you today?`,
};

const SUGGESTED_QUERIES = [
  'What are your core capabilities?',
  'Tell me about the Security Automation Playbook.',
  'What projects have you worked on?',
  'Where are you based and are you taking clients?',
];

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
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
  }, [isOpen, messages]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const payloadHistory = messages.map((m) => ({
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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Thanks for reaching out! Let me know if you would like to explore any other projects.',
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat query failed:', err);
      const errorMessage = err?.message || 'API Key missing. Please add GEMINI_API_KEY to your environment variables.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div id="ai-chat-container" className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={onToggle}
          id="ai-chat-floating-button"
          type="button"
          className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-neutral-950 text-neutral-50 shadow-2xl hover:bg-neutral-800 transition-all duration-300 border border-neutral-800 hover:scale-105 active:scale-95 cursor-pointer font-sans text-xs sm:text-sm font-medium tracking-wide"
          aria-label="Open AI Chat Assistant"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>✨ Chat with AI</span>
        </button>
      ) : (
        <div
          id="ai-chat-window"
          className="w-[92vw] sm:w-96 md:w-[420px] h-[520px] max-h-[85vh] bg-neutral-50 border border-neutral-300 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Chat Window Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 text-neutral-50 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <span className="font-sans text-xs font-semibold block leading-none text-white">
                  AI Studio Assistant
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                  Grounded • Real-time
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                type="button"
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggle}
                id="ai-chat-close-btn"
                type="button"
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Query Pills */}
          <div className="px-3 py-2 bg-neutral-100/90 border-b border-neutral-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                type="button"
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[10px] font-mono text-neutral-700 bg-white border border-neutral-300 hover:border-neutral-900 hover:text-neutral-950 transition-colors shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs sm:text-sm">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isError = msg.id.startsWith('err-');
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1 px-1">
                    {isUser ? 'YOU' : isError ? 'SYSTEM NOTICE' : 'AI ASSISTANT'}
                  </span>
                  <div
                    className={`p-3 rounded-lg max-w-[90%] leading-relaxed ${
                      isUser
                        ? 'bg-neutral-950 text-neutral-50 rounded-br-none shadow-xs'
                        : isError
                        ? 'bg-amber-50 text-amber-950 border border-amber-300/80 rounded-bl-none'
                        : 'bg-neutral-200/60 text-neutral-900 border border-neutral-300/80 rounded-bl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="markdown-body space-y-2 text-xs sm:text-sm">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex flex-col items-start">
                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1 px-1">
                  AI ASSISTANT
                </span>
                <div className="p-3 rounded-lg bg-neutral-200/60 text-neutral-700 border border-neutral-300/80 rounded-bl-none flex items-center gap-2 font-mono text-xs">
                  <span className="w-2 h-2 rounded-full bg-neutral-800 animate-ping" />
                  <span>Consulting portfolio records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              id="ai-chat-input-field"
              type="text"
              placeholder="Ask about capabilities, projects, availability..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-md border border-neutral-300 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 font-sans text-xs focus:outline-hidden focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 disabled:opacity-50"
            />
            <button
              id="ai-chat-send-btn"
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-md bg-neutral-950 text-neutral-50 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-950 transition-colors shrink-0"
              aria-label="Send message to AI assistant"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
