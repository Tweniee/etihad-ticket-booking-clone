"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

interface ChatbotButtonProps {
  chatUrl?: string;
}

export default function ChatbotButton({
  chatUrl = "https://chat.example.com",
}: ChatbotButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    window.open(chatUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-300"
      aria-label="Open chat support"
      title="Chat with us"
    >
      {isHovered ? (
        <MessageCircle className="h-6 w-6 animate-pulse" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </button>
  );
}
