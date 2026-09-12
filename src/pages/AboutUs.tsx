import React from "react";
import { Sparkles, Award, ShieldCheck, Heart, Leaf, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import Logo3D from "../components/Logo3D";
import { useSEO } from "../lib/useSEO";

export default function AboutUs() {
  useSEO({
    title: "من نحن",
    description: "تعرف على قصة أرياف للعطور ومبادئها وقيمها.",
    url: window.location.href,
  });

  return (
    <div className="min-h-screen bg-[#FFFDF8] font-cairo">
      {/* Editorial Hero */}
      <div className="relative bg-[#2A1A17] text-cream py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Decorative Motifs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] border-[0.5px] border-gold/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] border-[0.5px] border-gold/10 rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <Logo3D light size="lg" className="mb-8 opacity-90" />
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-alexandria mb-6 text-cream leading-tight">
            من الطبيعة تبدأ الحكاية
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-cream/80 leading-relaxed font-light max-w-2xl">
            دار عطور عُمانية فاخرة وُلدت من شغف عميق بالروائح الشرقية النقية وسحر الطبيعة الأخّاذ.
            نبتكر لكل نفحة حكاية، ونجعل من العطر بصمة استثنائية لا تُنسى.
          </p>
        </div>
      </div>

      {/* Narrative & Craftsmanship (Editorial Split Layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full lg:w-5/12 aspect-[4/5] lg:aspect-[3/4] relative rounded-t-[120px] rounded-b-none overflow-hidden order-2 lg:order-1 border border-gold/10 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85"
              alt="عطور أرياف الفاخرة"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1A17]/30 to-transparent mix-blend-multiply" />
          </div>

          <div className="w-full lg:w-7/12 space-y-6 text-right order-1 lg:order-2">
            <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">
              حكاية أرياف
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2A1A17] font-alexandria leading-[1.2]">
              كل زجاجة.. <br /> قطعة فنية مصقولة
            </h2>
            <div className="w-12 h-px bg-gold/50 my-6" />
            <p className="text-sm lg:text-base text-taupe leading-[2] font-light max-w-xl">
              في أرياف، لا نصنع عطراً عادياً، بل نبتكر تجربة حواس متكاملة. تبدأ من تصميم الزجاجة المستوحى من نقاء الطبيعة، وتمر بتوليفة الهرم العطري المتدرج بانسجام، حتى تغليف العلبة المخملي المصمم للإهداء الفاخر.
            </p>
            <p className="text-sm lg:text-base text-taupe leading-[2] font-light max-w-xl">
              نؤمن بأن العطر هو الترجمة الصامتة لشخصيتك، لذا نحرص على تقديم مزيج يعكس الفخامة والأصالة في كل رشة.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values / Brand Principles */}
      <div className="bg-[#FAF8F5] py-20 lg:py-32 border-y border-gold/10 relative overflow-hidden">
        <div className="absolute top-0 right-1/2 w-px h-24 bg-gradient-to-b from-gold/40 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-black text-[#2A1A17] font-alexandria mb-16">
            مبادئ وقيم دار أرياف
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gold/5 rounded-full scale-150 transition-transform group-hover:scale-175" />
                <Leaf className="w-8 h-8 text-gold relative z-10 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-[#2A1A17] mb-4">مكونات طبيعية 100%</h3>
              <div className="w-8 h-px bg-gold/30 mx-auto mb-4 transition-all group-hover:w-12" />
              <p className="text-sm text-taupe leading-relaxed font-light max-w-xs">
                ننتقي زيوتنا العطرية من أندر مزارع الورد الطائفي وخشب العود المعتق دون أي إضافات كيميائية ضارة.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gold/5 rounded-full scale-150 transition-transform group-hover:scale-175" />
                <Award className="w-8 h-8 text-gold relative z-10 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-[#2A1A17] mb-4">ثبات وفوحان ملكي</h3>
              <div className="w-8 h-px bg-gold/30 mx-auto mb-4 transition-all group-hover:w-12" />
              <p className="text-sm text-taupe leading-relaxed font-light max-w-xs">
                تركيزات استثنائية (Eau de Parfum) تمنحك هالة عطرية ساحرة ترافقك وتترك أثراً جذاباً طوال اليوم.
              </p>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gold/5 rounded-full scale-150 transition-transform group-hover:scale-175" />
                <Compass className="w-8 h-8 text-gold relative z-10 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-[#2A1A17] mb-4">أصالة التراث والابتكار</h3>
              <div className="w-8 h-px bg-gold/30 mx-auto mb-4 transition-all group-hover:w-12" />
              <p className="text-sm text-taupe leading-relaxed font-light max-w-xs">
                نمزج بين تراث الشرق العربي العريق وأحدث تقنيات تصنيع وتعتيق العطور العالمية الراقية.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Closing CTA */}
      <div className="py-24 text-center px-4">
        <Sparkles className="w-6 h-6 text-gold/60 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-[#2A1A17] font-alexandria mb-8">
          اكتشف بصمتك العطرية الآن
        </h2>
        <Link 
          to="/shop" 
          className="inline-flex items-center justify-center px-10 py-4 bg-[#2A1A17] text-cream font-bold text-sm tracking-wide hover:bg-gold transition-colors duration-300"
        >
          استكشاف تشكيلة أرياف
        </Link>
      </div>

    </div>
  );
}
