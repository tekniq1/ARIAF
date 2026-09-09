import React from "react";
import { MessageCircle } from "lucide-react";
import { useStore } from "../lib/store";

export default function WhatsAppButton() {
  const { settings } = useStore();
  const rawNumber = settings.whatsapp.number.replace(/[^0-9]/g, "") || "96891234567";
  const defaultMessage = encodeURIComponent(
    "السلام عليكم ورحمة الله وبركاته، أود الاستفسار بخصوص عطور أرياف الفاخرة."
  );

  return (
    <aside
      aria-label="محادثة واتساب المباشرة"
      className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40"
    >
      <a
        href={`https://wa.me/${rawNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل مع خبير عطور أرياف عبر واتساب"
        className="group flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-full shadow-2xl border border-emerald-400/40 hover:border-gold transition-all duration-300 transform hover:scale-105"
      >
        <MessageCircle className="w-6 h-6 animate-pulse" />
        <span className="hidden sm:inline text-xs font-bold font-alexandria tracking-wide">
          تواصل مع خبير أرياف
        </span>
      </a>
    </aside>
  );
}
