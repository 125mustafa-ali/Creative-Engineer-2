import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  timestamp?: string;
}

export interface AiChatAssistantProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const WELCOME_GREETING =
  "Hi! I'm Mustafa's AI assistant, grounded directly in his live portfolio and studio data. What would you like to know about his projects, capabilities, or availability?";

const STARTER_PROMPTS = [
  'What are Mustafa’s core capabilities?',
  'Tell me about recent projects',
  'Is Mustafa accepting new client work?',
  'How can I get in touch with the studio?',
];

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const toggleChat = controlledOnToggle || (() => setInternalIsOpen((prev) => !prev));

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: WELCOME_GREETING,
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

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
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
      // Multi-turn history, ignoring welcome and error notices
      const payloadHistory = messages
        .filter((m) => !m.isError && m.id !== 'welcome-msg')
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
        }),
      });

      const contentType = res.headers.get('content-type') || '';

      // Bulletproof check: 503 or HTML response (cloud container warmup / gateway)
      if (res.status === 503 || contentType.includes('text/html')) {
        throw new Error('Waking up the AI, please wait a moment and try again.');
      }

      if (!res.ok) {
        let errorMsg = 'Waking up the AI, please wait a moment and try again.';
        if (contentType.includes('application/json')) {
          try {
            const errorJson = await res.json();
            if (errorJson?.error && errorJson.code !== 503) {
              errorMsg = errorJson.error;
            }
          } catch (_) {}
        }
        throw new Error(errorMsg);
      }

      if (!contentType.includes('application/json')) {
        throw new Error('Waking up the AI, please wait a moment and try again.');
      }

      const data = await res.json();
      if (!data || typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('Waking up the AI, please wait a moment and try again.');
      }

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const messageToDisplay =
        err?.message?.includes('Waking up the AI') || !err?.message
          ? 'Waking up the AI, please wait a moment and try again.'
          : err.message;

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          isError: true,
          content: messageToDisplay,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: WELCOME_GREETING,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div id="ai-chat-assistant-container" className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={toggleChat}
          id="ai-chat-open-button"
          type="button"
          className="group inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-neutral-950 text-neutral-50 shadow-xl hover:bg-neutral-800 transition-all duration-200 border border-neutral-800 cursor-pointer font-sans text-sm font-medium hover:scale-105 active:scale-95"
          aria-label="Open AI Assistant"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>Ask AI</span>
        </button>
      ) : (
        <div
          id="ai-chat-window"
          className="w-[92vw] sm:w-[420px] md:w-[440px] h-[550px] max-h-[85vh] bg-white border border-neutral-300 rounded-xl shadow-2xl flex flex-col overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-neutral-950 text-neutral-50 shrink-0 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-emerald-400 border border-neutral-700">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white leading-tight">
                  Ask AI
                </h3>
                <p className="text-[10px] text-neutral-400 flex items-center gap-1.5 leading-tight mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Grounded in Studio Data</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                type="button"
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleChat}
                type="button"
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Starter Prompts (shown when only welcome message is present) */}
          {messages.length <= 1 && (
            <div className="p-2.5 bg-neutral-50 border-b border-neutral-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  type="button"
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full text-xs font-sans text-neutral-700 bg-white border border-neutral-300 hover:border-neutral-900 hover:text-neutral-950 transition-colors shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages Thread */}
          <div
            id="ai-chat-messages-thread"
            className="flex-1 p-3 overflow-y-auto space-y-3 font-sans text-sm"
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                    <span>{isUser ? 'YOU' : msg.isError ? 'NOTICE' : 'ASSISTANT'}</span>
                    {msg.timestamp && <span>{msg.timestamp}</span>}
                  </div>

                  <div
                    className={`p-3 rounded-lg max-w-[90%] text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-neutral-950 text-white rounded-br-xs'
                        : msg.isError
                        ? 'bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-bl-xs flex items-start gap-2.5'
                        : 'bg-neutral-100 text-neutral-900 border border-neutral-200/80 rounded-bl-xs'
                    }`}
                  >
                    {msg.isError && (
                      <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                    )}
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1 px-1 text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                  <span>ASSISTANT</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200/80 rounded-bl-xs flex items-center gap-2 text-xs font-sans">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-700" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2 shrink-0 font-sans"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about projects, capabilities, or availability..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-md border border-neutral-300 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 font-sans text-xs focus:outline-hidden focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-md bg-neutral-950 text-neutral-50 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-950 transition-colors shrink-0 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
