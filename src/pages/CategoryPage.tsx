import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Category, Product } from "../lib/types";
import ProductCard from "../components/ProductCard";
import { useSEO } from "../lib/useSEO";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: category ? category.name_ar : "التصنيفات",
    description: category ? category.description : "تصفح تصنيفات عطور أرياف.",
    image: category ? category.image_url : undefined,
    url: window.location.href,
  });

  useEffect(() => {
    async function loadCategory() {
      if (!slug) return;
      try {
        setLoading(true);
        const { data: cat } = await supabase
          .from("categories")
          .select("*")
          .eq("slug", slug)
          .single();

        if (cat) {
          setCategory(cat);
          const { data: prods } = await supabase
            .from("products")
            .select("*, category:categories(name_ar, name_en), product_images(*), product_variants(*)")
            .eq("category_id", cat.id)
            .eq("is_active", true);

          if (prods) setProducts(prods as Product[]);
        }
      } catch (err) {
        console.error("Error loading category:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-burgundy">جاري استكشاف التشكيلة العطرية...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] py-20 text-center px-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-burgundy mb-4">التصنيف غير موجود</h2>
        <Link to="/shop" className="text-sm text-gold-dark hover:underline font-bold">
          العودة إلى متجر العطور
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Category Hero Banner */}
      <div className="relative bg-burgundy-dark text-cream py-16 px-4 sm:px-6 lg:px-8 overflow-hidden mb-12 border-b border-gold/30">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${category.image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-dark via-burgundy-dark/90 to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-xs text-cream/60 mb-3">
            <Link to="/" className="hover:text-gold">الرئيسية</Link> /{" "}
            <Link to="/categories" className="hover:text-gold">التصنيفات</Link> /{" "}
            <span className="text-gold font-bold">{category.name_ar}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-soft text-xs font-semibold mb-3 border border-gold/30">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="font-serif uppercase tracking-wider">{category.name_en}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-alexandria mb-4">
            {category.name_ar}
          </h1>

          <p className="text-cream/80 text-sm sm:text-base max-w-2xl leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-graySoft">
          <p className="text-sm text-darkText/70">
            تصفح <span className="font-bold text-burgundy">{products.length}</span> عطور في هذا التصنيف
          </p>
          <Link
            to="/shop"
            className="text-xs font-bold text-gold-dark hover:text-burgundy flex items-center gap-1"
          >
            <span>مجموعة أرياف</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white/70 rounded-3xl border border-gold/20 p-8">
            <p className="text-sm text-darkText/70 mb-4">لا توجد منتجات مسجلة في هذا التصنيف حالياً.</p>
            <Link
              to="/shop"
              className="px-6 py-2.5 rounded-full bg-burgundy text-cream text-xs font-bold shadow-md"
            >
              استكشف باقي التشكيلات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
