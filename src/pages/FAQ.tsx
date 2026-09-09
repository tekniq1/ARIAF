import React, { useState } from "react";
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "ما هي مدة وتكلفة الشحن والتوصيل؟",
      a: "نوفر شحناً سريعاً لكافة مدن ومحافظات سلطنة عُمان خلال 2 إلى 4 أيام عمل. التوصيل مجاني للطلبات التي تزيد عن 25 ر.ع، ورسوم الشحن الثابتة للطلبات الأقل هي 2 ر.ع فقط.",
    },
    {
      q: "ما هو تركيز عطور أرياف ومستوى ثباتها؟",
      a: "جميع عطور دار أرياف تأتي بتركيز Eau de Parfum فائق النقاء، ومصنوعة من زيوت عطرية طبيعية معتقة تدوم لأكثر من 24 ساعة على الملابس وثبات فوّاح على البشرة.",
    },
    {
      q: "ما هي سياسة الاستبدال والاسترجاع؟",
      a: "نقدم في أرياف ضماناً ذهبياً: نوفر عينة تجريبية مجانية مع كل زجاجة عطر، يمكنك تجربة العينة، وفي حال لم يناسبك العطر يمكنك إرجاع الزجاجة الأصلية مغلقة بحالتها وسنعيد لك كامل المبلغ خلال 7 أيام من استلام الطلب.",
    },
    {
      q: "هل يتوفر الدفع عند الاستلام؟",
      a: "نعم، يتوفر خيار الدفع عند الاستلام في معظم ولايات ومحافظات سلطنة عُمان، كما نوفر خيارات التحويل البنكي والتأكيد المباشر عبر واتساب.",
    },
    {
      q: "كيف يمكنني تتبع طلبي؟",
      a: "بمجرد إتمام الطلب، يمكنك متابعته مباشرة من حسابك في الموقع أو من خلال محادثة خدمة عملاء أرياف على واتساب برقم الطلب (مثال: ARY-2026-XXXXX).",
    },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-gold-dark uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>مركز المساعدة</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-burgundy font-alexandria">
          الأسئلة الشائعة
        </h1>
        <p className="text-xs sm:text-sm text-darkText/70 mt-2">
          إجابات عن أكثر الأسئلة شيوعاً حول عطور أرياف، الشحن، والضمان الذهبي
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gold/25 shadow-card overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-right p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-burgundy hover:text-gold-dark transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gold transition-transform duration-300 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-darkText/80 leading-relaxed border-t border-graySoft/40 pt-4 bg-beige/20">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
