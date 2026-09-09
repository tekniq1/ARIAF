import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle, Send, Sparkles } from "lucide-react";
import Logo3D from "./Logo3D";
import { useStore } from "../lib/store";

export default function Footer() {
  const { settings, showToast } = useStore();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      showToast("شكراً لانضمامك إلى نادي أرياف الحصري! ستصلك أحدث عروضنا وقصائد عطورنا.");
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#2A1A17] text-cream relative border-t border-gold/10 overflow-hidden">
      {/* Subtle ARAYAF Decorative Motif */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] border-[0.5px] border-gold/10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] border-[0.5px] border-gold/10 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Link to="/" className="mb-6 inline-block">
              <Logo3D light size="md" />
            </Link>
            <p className="text-sm text-cream/70 leading-relaxed font-light max-w-sm mb-8">
              مجموعة عطور فاخرة مستوحاة من جمال الطبيعة النقية وأصالة الشرق العريق.
              نصنع لكل لحظة حكاية عطرية لا تُنسى.
            </p>
            
            {/* Social Icons - Minimal */}
            <div className="flex items-center gap-4">
              {[
                { name: "Instagram", icon: "📸", href: "https://instagram.com" },
                { name: "TikTok", icon: "🎵", href: "https://tiktok.com" },
                { name: "Snapchat", icon: "👻", href: "https://snapchat.com" },
                { name: "X", icon: "𝕏", href: "https://x.com" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full border border-gold/20 flex items-center justify-center text-sm text-gold-soft hover:bg-gold hover:text-[#2A1A17] transition-all duration-300"
                  aria-label={s.name}
                >
                  <span className="opacity-90">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-gold mb-6 uppercase tracking-widest">
              روابط سريعة
            </h4>
            <ul className="space-y-4 text-sm font-light text-cream/80">
              <li><Link to="/" className="hover:text-gold-soft transition-colors">الرئيسية</Link></li>
              <li><Link to="/shop" className="hover:text-gold-soft transition-colors">استكشف العطور</Link></li>
              <li><Link to="/categories" className="hover:text-gold-soft transition-colors">عوالم أرياف</Link></li>
              <li><Link to="/about" className="hover:text-gold-soft transition-colors">قصتنا</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-gold mb-6 uppercase tracking-widest">
              خدمة العملاء
            </h4>
            <ul className="space-y-4 text-sm font-light text-cream/80">
              <li><Link to="/contact" className="hover:text-gold-soft transition-colors">تواصل معنا</Link></li>
              <li><Link to="/faq" className="hover:text-gold-soft transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link to="/faq?tab=shipping" className="hover:text-gold-soft transition-colors">الشحن والتوصيل</Link></li>
              <li><Link to="/faq?tab=returns" className="hover:text-gold-soft transition-colors">الاسترجاع والاستبدال</Link></li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-gold mb-6 uppercase tracking-widest">
              نادي النخبة
            </h4>
            <p className="text-xs text-cream/70 font-light mb-4 leading-relaxed">
              اشترك لتصلك أحدث إصداراتنا العطرية وعروضنا الحصرية المخصصة لأعضاء أرياف.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 mb-10">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                required
                className="w-full bg-cream/5 border border-gold/30 rounded-sm px-4 py-3 text-xs text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="bg-gold hover:bg-gold-soft text-[#2A1A17] px-6 py-3 rounded-sm font-bold text-xs transition-colors shrink-0 flex items-center justify-center gap-2"
              >
                <span>اشتراك</span>
                <Send className="w-3 h-3" />
              </button>
            </form>

            <div className="space-y-3 text-xs font-light text-cream/70">
              <a href={`https://wa.me/${settings.whatsapp.number.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-gold-soft transition-colors">
                <MessageCircle className="w-4 h-4 text-gold/80" />
                <span dir="ltr">{settings.whatsapp.number}</span>
              </a>
              <a href={`tel:${settings.phone.number.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-gold-soft transition-colors">
                <Phone className="w-4 h-4 text-gold/80" />
                <span dir="ltr">{settings.phone.number}</span>
              </a>
              <a href={`mailto:${settings.email.email}`} className="flex items-center gap-3 hover:text-gold-soft transition-colors">
                <Mail className="w-4 h-4 text-gold/80" />
                <span>{settings.email.email}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Bottom Bar */}
        <div className="mt-20 pt-6 border-t border-gold/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-cream/50 font-light gap-4">
          <p>© {new Date().getFullYear()} دار أرياف للعطور الفاخرة. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-3">
            <span>شغف الأصالة العمانية</span>
            <span className="w-1 h-1 rounded-full bg-gold/50" />
            <span>صلالة - مسقط</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
