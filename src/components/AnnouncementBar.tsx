import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";

export default function AnnouncementBar() {
  const { settings } = useStore();
  const bar = settings.announcement_bar;

  if (!bar || bar.enabled === false || !bar.text) {
    return null;
  }

  const content = (
    <div
      style={{
        backgroundColor: bar.bg_color === "#3B0716" || !bar.bg_color ? "#3E2723" : bar.bg_color,
        color: bar.text_color === "#FFFDF8" || !bar.text_color ? "#E8DCC4" : bar.text_color,
      }}
      className="w-full py-1.5 px-4 text-center text-[11px] font-medium tracking-wide transition-colors duration-300 relative z-50 border-b border-gold/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span className="opacity-90">{bar.text}</span>
      </div>
    </div>
  );

  if (bar.link) {
    return (
      <Link to={bar.link} className="block hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
