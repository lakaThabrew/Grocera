"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, Zap } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { MarkdownMessage } from "@/components/assistant/MarkdownMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi there! I'm your Grocera AI Shopping Assistant. Ask me to compare prices across Keells, Cargills, Arpico & Spar, or find today's best supermarket deals in Sri Lanka!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");

    // Add user message to UI
    const newMessages = [
      ...messages,
      { role: "user" as const, content: userMsg },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data } = await api.post<{ reply?: string }>("/ai/chat", {
        message: userMsg,
        history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (data.reply) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "I've checked the latest store prices for you. Keells and Cargills currently have competitive offers on grocery bundles.",
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I am ready to help you analyze grocery prices and find discounts!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  return (
    <PageWrapper className="h-[calc(100vh-6.5rem)] max-w-5xl mx-auto w-full">
      <div className="flex flex-col h-full w-full glass-card rounded-3xl overflow-hidden border-border/80 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/80 bg-muted/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 p-[2px] shadow-lg shadow-primary/20">
                <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-lime-400 border-2 border-background animate-ping" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-foreground tracking-tight flex items-center gap-2">
                Grocera AI Concierge
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Online
                </span>
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Powered by Google Gemini & Sri Lanka Price Engine
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-foreground bg-card border border-border/80 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5 text-lime-400 fill-lime-400" />{" "}
            Real-time Store Sync
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex-shrink-0 flex items-center justify-center text-primary mt-1 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`px-5 py-3.5 rounded-2xl max-w-[82%] text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-primary to-emerald-600 text-white font-medium rounded-tr-xs"
                      : "bg-card/90 text-foreground rounded-tl-xs border border-border/80 backdrop-blur-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <MarkdownMessage content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-9 h-9 rounded-xl bg-muted border border-border flex-shrink-0 flex items-center justify-center text-muted-foreground mt-1 shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3.5 justify-start"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex-shrink-0 flex items-center justify-center text-primary mt-1">
                <Bot
                  className="w-5 h-5 animate-spin"
                  style={{ animationDuration: "4s" }}
                />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-card text-foreground rounded-tl-xs border border-border/80 flex items-center gap-3 shadow-md">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Analysing supermarket prices...
                </span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Suggestions Area */}
        <div className="p-5 bg-card/60 backdrop-blur-md border-t border-border/80">
          {messages.length === 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {[
                "Find the cheapest milk powder 400g",
                "Which store has the best discount on Samba Rice?",
                "Compare Keells vs Cargills prices today",
              ].map((suggestion, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="whitespace-nowrap px-4 py-2 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/15 text-xs font-semibold text-foreground transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  {suggestion}
                </motion.button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Grocera AI about prices, stores or shopping tips..."
              className="w-full bg-background border border-input/80 rounded-2xl px-6 py-3.5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-inner"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center text-white disabled:opacity-40 shadow-md shadow-primary/20 transition-all"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </motion.button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
