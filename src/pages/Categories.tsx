import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { Category } from "../lib/types";
import { useSEO } from "../lib/useSEO";

// Helper for Editorial Mosaic Grid on Desktop
const getMosaicClasses = (index: number) => {
  const mod = index % 5;
  const base = "relative group block overflow-hidden rounded-[24px] sm:rounded-[32px] bg-beige border border-transparent transition-colors duration-500";
  
  // Mobile: 1 per row. Tablet: 2 per row. Desktop: 12-col grid with row-span.
  if (mod === 0) return `${base} col-span-1 sm:col-span-2 lg:col-span-8 lg:row-span-1 h-[450px] sm:h-[400px] lg:h-auto`;
  if (mod === 1) return `${base} col-span-1 sm:col-span-1 lg:col-span-4 lg:row-span-2 h-[450px] sm:h-[400px] lg:h-auto`;
  if (mod === 2) return `${base} col-span-1 sm:col-span-1 lg:col-span-8 lg:row-span-1 h-[450px] sm:h-[400px] lg:h-auto`;
  if (mod === 3) return `${base} col-span-1 sm:col-span-1 lg:col-span-6 lg:row-span-1 h-[450px] sm:h-[400px] lg:h-auto`;
  if (mod === 4) return `${base} col-span-1 sm:col-span-1 lg:col-span-6 lg:row-span-1 h-[450px] sm:h-[400px] lg:h-auto`;
  return `${base} col-span-1 sm:col-span-2 lg:col-span-6 h-[450px] sm:h-[400px] lg:h-auto`;
};

export default function Categories() {
  useSEO({
    title: "التصنيفات الملكية",
    description: "استكشف المجموعات العطرية المتنوعة من أرياف.",
    url: window.location.href,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order");
        
        let fetched = data || [];
        
        // --- MOCK DATA FALLBACK FOR PREVIEW ---
        if (fetched.length === 0) {
          fetched = [
            { id: '1', name_ar: 'العود الفاخر', name_en: 'LUXURY OUD', slug: 'oud', description: 'توليفة ملكية من دهن العود المعتق', image_url: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=1200&q=80', is_active: true, display_order: 1 },
            { id: '2', name_ar: 'لبان ظفار', name_en: 'DHOFAR FRANKINCENSE', slug: 'frankincense', description: 'أصالة الماضي بلمسة عصرية', image_url: 'https://images.unsplash.com/photo-1594034184171-18a4ebc52119?auto=format&fit=crop&w=800&q=80', is_active: true, display_order: 2 },
            { id: '3', name_ar: 'المسك والعنبر', name_en: 'MUSK & AMBER', slug: 'musk', description: 'نعومة المسك ودفء العنبر الأصيل', image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80', is_active: true, display_order: 3 },
            { id: '4', name_ar: 'المجموعة الحصرية', name_en: 'EXCLUSIVE', slug: 'exclusive', description: 'عطور محدودة الإصدار للنخبة', image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80', is_active: true, display_order: 4 },
          ];
        }

        setCategories(fetched);
      } catch (e) {
        console.error("Error loading categories:", e);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF8] pt-12 pb-24 sm:pt-20 sm:pb-32 overflow-hidden relative">
      
      {/* Decorative ARAYAF Identity Background */}
      <div className="absolute inset-0 pointer-events-none flex justify-center opacity-[0.03]">
        <div className="w-[1000px] h-[1000px] rounded-full border-[1.5px] border-burgundy/40 scale-150 absolute top-[-20%] left-[-10%]" />
        <div className="w-[800px] h-[800px] rounded-full border border-gold/40 scale-150 absolute top-[10%] right-[-10%]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Intro */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-24"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-4 opacity-80">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs font-bold text-taupe uppercase tracking-widest">التصنيفات الملكية</span>
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-burgundy font-alexandria mb-6 tracking-tight">
            عوالم أرياف
          </h1>
          
          <p className="text-taupe text-sm sm:text-base leading-relaxed max-w-md mx-auto font-light">
            استكشف المجموعات العطرية المتنوعة، صُممت كل مجموعة لتكون رحلة حسيّة خاصة تليق بذوقك الرفيع.
          </p>
        </motion.div>

        {/* Categories Mosaic Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[380px] gap-4 sm:gap-6 lg:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`${getMosaicClasses(i)} bg-taupe/5 animate-pulse rounded-[32px]`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[380px] gap-4 sm:gap-6 lg:gap-8">
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={getMosaicClasses(index)}
                aria-label={`تصفح مجموعة ${cat.name_ar}`}
              >
                {/* Fallback pattern if no image */}
                {!cat.image_url && (
                  <div className="absolute inset-0 bg-cream flex items-center justify-center opacity-50">
                    <Sparkles className="w-12 h-12 text-gold/20" />
                  </div>
                )}
                
                {/* Main Image */}
                <img
                  src={cat.image_url || "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80"}
                  alt={cat.name_ar}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-out"
                />

                {/* Soft bottom gradient for text contrast (Not heavy) */}
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-dark/80 via-burgundy-dark/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                
                {/* Text Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end">
                  <motion.div 
                    initial={false}
                    className="transform group-hover:-translate-y-2 transition-transform duration-500 ease-out"
                  >
                    <span className="text-[10px] sm:text-xs font-serif uppercase tracking-[0.2em] text-gold-soft block mb-2 opacity-90 drop-shadow-sm">
                      {cat.name_en}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-cream mb-2 drop-shadow-md">
                      {cat.name_ar}
                    </h3>
                    
                    {/* Inline CTA */}
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-cream/90 lg:opacity-0 group-hover:opacity-100 transform lg:translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <span>اكتشف المجموعة</span>
                      <ArrowLeft className="w-4 h-4 text-gold" />
                    </div>
                  </motion.div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
