import React, { useState } from "react";
import { MessageCircle, Phone, Mail, MapPin, Send, Sparkles, ArrowLeft } from "lucide-react";
import { useStore } from "../lib/store";
import { useSEO } from "../lib/useSEO";

export default function Contact() {
  useSEO({
    title: "تواصل معنا",
    description: "تواصل مع دار أرياف للعطور لأي استفسار أو طلبات خاصة.",
    url: window.location.href,
  });

  const { settings, showToast } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    setSent(true);
    showToast("شكراً لتواصلك معنا! سيقوم فريق خدمة عملاء أرياف بالرد عليك قريباً.");
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-20">
      
      {/* Page Intro */}
      <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] border-[0.5px] border-gold/10 rounded-full opacity-30 pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold text-gold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>في خدمتكم دائماً</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2A1A17] font-alexandria mb-6">
            تواصل مع دار أرياف
          </h1>
          <p className="text-sm lg:text-base text-taupe leading-relaxed font-light">
            يسعدنا استقبال استفساراتكم واقتراحاتكم وطلبات الإهداء الخاصة على مدار الساعة.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Contact Information (Desktop: Right, Mobile: Top) */}
          <div className="lg:col-span-4 space-y-10 order-1 lg:order-1">
            
            {/* Quick Contact / WhatsApp */}
            <div className="bg-[#FAF8F5] border border-gold/20 p-8 rounded-[2px]">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                <MessageCircle className="w-5 h-5 text-gold" />
              </div>
              <h3 className="text-lg font-bold text-[#2A1A17] mb-2 font-alexandria">المحادثة الفورية</h3>
              <p className="text-sm text-taupe mb-6 font-light">تواصل مباشر وسريع مع خبير العطور عبر واتساب.</p>
              <a
                href={`https://wa.me/${settings.whatsapp.number.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#2A1A17] hover:text-gold transition-colors group"
                dir="ltr"
              >
                <span>{settings.whatsapp.number}</span>
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </a>
            </div>

            {/* Other Information List */}
            <div className="space-y-8 px-4">
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <Phone className="w-5 h-5 text-gold/80 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2A1A17] mb-1">الاتصال الهاتفي</h4>
                  <p className="text-xs text-taupe mb-1.5 font-light">ساعات العمل: 9 صباحاً - 11 مساءً</p>
                  <a
                    href={`tel:${settings.phone.number.replace(/\s/g, "")}`}
                    className="inline-block text-sm font-bold text-[#2A1A17] hover:text-gold transition-colors"
                    dir="ltr"
                  >
                    {settings.phone.number}
                  </a>
                </div>
              </div>

              <div className="w-12 h-px bg-gold/20" />

              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <Mail className="w-5 h-5 text-gold/80 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2A1A17] mb-1">البريد الإلكتروني</h4>
                  <p className="text-xs text-taupe mb-1.5 font-light">للشراكات والاستفسارات العامة</p>
                  <a
                    href={`mailto:${settings.email.email}`}
                    className="inline-block text-sm font-bold text-[#2A1A17] hover:text-gold transition-colors"
                  >
                    {settings.email.email}
                  </a>
                </div>
              </div>

              <div className="w-12 h-px bg-gold/20" />

              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <MapPin className="w-5 h-5 text-gold/80 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2A1A17] mb-1">المقر الرئيسي</h4>
                  <p className="text-sm text-taupe leading-relaxed font-light">
                    شارع السلطان قابوس<br />صلالة، سلطنة عُمان
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8 order-2 lg:order-2">
            <div className="bg-[#FAF8F5] border border-gold/10 p-6 sm:p-10 rounded-[2px]">
              <h2 className="text-xl font-bold text-[#2A1A17] mb-8 font-alexandria">أرسل لنا رسالة</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">الاسم الكريم</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="محمد بن عبدالعزيز"
                    className="w-full px-5 py-3.5 bg-[#FFFDF8] border border-gold/20 text-sm text-[#2A1A17] placeholder:text-taupe/50 focus:bg-[#FFFDF8] focus:border-gold/50 outline-none transition-all duration-300 rounded-[2px]"
                  />
                </div>


                <div>
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0501234567"
                    className="w-full px-5 py-3.5 bg-[#FFFDF8] border border-gold/20 text-sm text-[#2A1A17] placeholder:text-taupe/50 focus:bg-[#FFFDF8] focus:border-gold/50 outline-none transition-all duration-300 rounded-[2px]"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">نص الرسالة أو الاستفسار</label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك أو استفسارك هنا..."
                    className="w-full px-5 py-3.5 bg-[#FFFDF8] border border-gold/20 text-sm text-[#2A1A17] placeholder:text-taupe/50 focus:bg-[#FFFDF8] focus:border-gold/50 outline-none transition-all duration-300 rounded-[2px] resize-y min-h-[120px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-4 bg-[#2A1A17] hover:bg-gold text-cream font-bold text-sm tracking-wide flex items-center justify-center gap-3 transition-colors duration-300 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <span>جارٍ الإرسال...</span>
                      <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>إرسال الرسالة الآن</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
