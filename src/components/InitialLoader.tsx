import React, { useEffect, useState } from "react";
import Logo3D from "./Logo3D";

export default function InitialLoader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // We just wait for the first paint to be done, plus a tiny delay for the animation to look elegant.
    // We don't block the user. The app will be ready underneath.
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(() => setLoading(false), 500); // 500ms fade out duration
    }, 600); // 600ms initial visible time
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2A1A17] transition-opacity duration-500 ease-in-out ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-busy="true"
      aria-label="جارٍ تحميل أرياف للعطور"
    >
      {/* Subtle Smoke Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] animate-pulse-glow" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* We use the light logo against the deep espresso background */}
        <Logo3D light size="lg" className="mb-8" />
        
        {/* Subtle Gold Line Animation */}
        <div className="w-32 h-[1px] bg-gold/10 overflow-hidden relative rounded-full">
          <div className="absolute top-0 left-0 h-full w-full bg-gold/80 origin-left animate-loader-line" />
        </div>
      </div>
    </div>
  );
}
