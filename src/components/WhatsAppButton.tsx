import React from "react";
import { MessageCircle } from "lucide-react";
import { useStore } from "../lib/store";

export default function WhatsAppButton() {
  const { settings } = useStore();
  const rawNumber = settings.whatsapp.number.replace(/[^0-9]/g, "") || "96891234567";
  const defaultMessage = encodeURIComponent(
    "السلام عليكم، أود الاستفسار بخصوص عطور أرياف."
  );

  return (
    <aside
      aria-label="محادثة واتساب المباشرة"
      className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40"
    >
      <a
        href={`https://wa.me/${rawNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل مع خبير عطور أرياف عبر واتساب"
        className="group relative flex items-center justify-center w-[52px] h-[52px] bg-[#FAF8F5] text-[#2A1A17] rounded-full shadow-luxury border border-gold/40 hover:border-gold hover:bg-gold hover:text-white transition-all duration-500 transform hover:scale-110"
      >
        <MessageCircle className="w-6 h-6 stroke-[1.5]" />
        
        {/* Subtle Ping Effect */}
        <span className="absolute inset-0 rounded-full border border-gold/50 animate-ping opacity-20 pointer-events-none" />
      </a>
    </aside>
  );
}
