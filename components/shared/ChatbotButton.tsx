"use client";

import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isStreaming?: boolean;
}

const LOADING_WORDS = [
  "thinking",
  "processing",
  "analyzing",
  "reasoning",
  "reflecting",
  "contemplating",
  "evaluating",
  "deliberating",
  "synthesizing",
  "computing",
  "inferring",
  "deriving",
  "resolving",
  "cognitive",
  "neuralScan",
  "mindFlow",
  "thoughtLoop",
  "brainWave",
  "logicPass",
  "dataMull",
  "cognix",
  "thinkaLoop",
  "neuramind",
  "mindify",
  "thoughtify",
  "neuroMull",
  "synaptrix",
  "cerebrox",
  "brainify",
  "logicore",
  "mentix",
  "mindora",
  "thinkron",
  "cognify",
  "neurix",
  "thoughtix",
  "mindplex",
  "logiclyn",
  "brainflux",
];

function getRandomLoadingWord(): string {
  return LOADING_WORDS[Math.floor(Math.random() * LOADING_WORDS.length)];
}

// Animated dots component
function AnimatedDots() {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block w-6 text-left">{".".repeat(dotCount)}</span>
  );
}

// Loading indicator component
function LoadingIndicator({ word }: { word: string }) {
  return (
    <span className="text-gray-500 italic flex items-center">
      <span>{word}</span>
      <AnimatedDots />
    </span>
  );
}

// Default welcome message
const getWelcomeMessage = (): Message => ({
  id: "1",
  text: "Hello! How can I help you today?",
  sender: "bot",
  timestamp: new Date(),
});

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingWord, setLoadingWord] = useState("");
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Monitor user login/logout and clear chat history on user change
  useEffect(() => {
    const checkUserChange = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          const newUserId = data.user?.id ?? null;

          // If user changed (login/logout/switch), clear chat history
          if (newUserId !== currentUserId) {
            setCurrentUserId(newUserId);
            // Only clear if this isn't the initial load (currentUserId was set before)
            if (currentUserId !== null || newUserId !== null) {
              setMessages([getWelcomeMessage()]);
            }
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };

    // Check immediately
    checkUserChange();

    // Poll for user changes every 5 seconds (catches login from other tabs)
    const interval = setInterval(checkUserChange, 5000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  // Get JWT token from API endpoint
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/auth/token");
      if (response.ok) {
        const data = await response.json();
        return data.token || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching auth token:", error);
      return null;
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");
    setIsLoading(true);
    setLoadingWord(getRandomLoadingWord());
    setHasStartedStreaming(false);

    // Create a placeholder for the bot's streaming response
    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      text: "",
      sender: "bot",
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, botMessage]);

    try {
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const token = await getAuthToken();

      const response = await fetch("http://74.162.57.122:8000/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Use text/plain for raw streaming (not application/json)
          Accept: "text/plain",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: messageText }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // CRITICAL: Check for readable stream support
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream not supported or no response body");
      }

      // TextDecoder handles UTF-8 multi-byte chars split across chunks
      // stream: true ensures partial sequences are buffered until complete
      const decoder = new TextDecoder("utf-8");
      let streamedText = "";

      try {
        while (true) {
          // read() returns { done: boolean, value: Uint8Array }
          const { done, value } = await reader.read();

          if (done) {
            // Flush any remaining buffered bytes
            const remaining = decoder.decode();
            if (remaining) {
              streamedText += remaining;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === botMessageId ? { ...msg, text: streamedText } : msg,
                ),
              );
            }
            break;
          }

          // Mark streaming started on first chunk received
          if (!streamedText) {
            setHasStartedStreaming(true);
          }

          // Decode chunk with stream:true to handle partial UTF-8 sequences
          const chunk = decoder.decode(value, { stream: true });
          streamedText += chunk;

          // Update UI immediately for real-time token display
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, text: streamedText } : msg,
            ),
          );
        }
      } finally {
        // Always release the reader lock
        reader.releaseLock();
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId ? { ...msg, isStreaming: false } : msg,
        ),
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Request was aborted, ignore
        return;
      }

      console.error("Chat API error:", error);

      // Update the bot message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: "Sorry, I encountered an error. Please try again.",
                isStreaming: false,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
      setHasStartedStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Chat Support</h3>
                <p className="text-xs text-white/80">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 transition-colors hover:bg-white/20"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.isStreaming &&
                    !hasStartedStreaming &&
                    !message.text ? (
                      <LoadingIndicator word={loadingWord} />
                    ) : (
                      <>
                        {message.text}
                        {message.isStreaming && hasStartedStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
                        )}
                      </>
                    )}
                  </div>
                  {!message.isStreaming && (
                    <p
                      className={`mt-1 text-xs ${
                        message.sender === "user"
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-300"
        aria-label={isOpen ? "Close chat" : "Open chat support"}
        title="Chat with us"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : isHovered ? (
          <MessageCircle className="h-6 w-6 animate-pulse" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </>
  );
}
