import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, X, Search, SlidersHorizontal, ArrowUpDown, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Product, Category } from "../lib/types";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import { useSEO } from "../lib/useSEO";

export default function Shop() {
  useSEO({
    title: "المتجر",
    description: "تسوق أفضل العطور الطبيعية والشرقية من أرياف.",
    url: window.location.href,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("search") || ""
  );
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const isBestOnly = searchParams.get("best") === "1";
  const isSaleOnly = searchParams.get("sale") === "1";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          supabase.from("categories").select("*").eq("is_active", true).order("display_order"),
          supabase
            .from("products")
            .select("*, category:categories(name_ar, name_en), product_images(*), product_variants(*)")
            .eq("is_active", true),
        ]);

        if (catsRes.data) setCategories(catsRes.data);
        if (prodsRes.data) setProducts(prodsRes.data as Product[]);
      } catch (err) {
        console.error("Error fetching shop data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory && p.category_id !== selectedCategory) {
        return false;
      }

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          p.name_ar.toLowerCase().includes(q) ||
          p.name_en.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q));
        if (!matchName) return false;
      }

      // Best sellers query param
      if (isBestOnly && !p.is_best_seller) return false;

      // Sale query param
      if (isSaleOnly && (!p.sale_price || p.sale_price >= p.price)) return false;

      // Price filter
      const currentPrice = p.sale_price ?? p.price;
      if (currentPrice > maxPrice) return false;

      // Size filter
      if (selectedSizes.length > 0) {
        const hasMatchingSize = p.product_variants?.some(
          (v) => selectedSizes.includes(v.value)
        );
        if (!hasMatchingSize) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.sale_price ?? a.price;
      const priceB = b.sale_price ?? b.price;

      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "rating") return (b.average_rating || 0) - (a.average_rating || 0);
      if (sortBy === "newest") return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, maxPrice, selectedSizes, sortBy, isBestOnly, isSaleOnly]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setMaxPrice(600);
    setSelectedSizes([]);
    setSortBy("featured");
    setSearchParams({});
  };

  // Determine Active Filters Count
  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    selectedSizes.length + 
    (maxPrice < 600 ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FFFDF8] relative pb-20">
      {/* Decorative Subtle Identity */}
      <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[150px] -right-[100px] w-[600px] h-[600px] rounded-full border-[0.5px] border-gold/20 opacity-30" />
        <div className="absolute -top-[250px] -right-[200px] w-[800px] h-[800px] rounded-full border-[0.5px] border-gold/10 opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12 sm:pt-16">
        
        {/* Page Intro */}
        <div className="mb-10 lg:mb-16 text-center lg:text-right">
          <nav className="text-[10px] sm:text-xs font-bold text-taupe/60 mb-4 flex items-center justify-center lg:justify-start gap-2 uppercase tracking-widest">
            <Link to="/" className="hover:text-gold transition-colors">الرئيسية</Link>
            <span className="text-gold/40">/</span>
            <span className="text-[#2A1A17]">المتجر</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2A1A17] font-alexandria mb-4">
            {isBestOnly
              ? "الأكثر طلباً ومبيعاً"
              : isSaleOnly
              ? "العروض الموسمية الخاصة"
              : "مجموعة أرياف — كل المنتجات"}
          </h1>
          <p className="text-sm font-light text-taupe max-w-xl mx-auto lg:mx-0">
            اكتشف تشكيلتنا الكاملة من العطور والبخور واللبان والمخمريات — مصنوعة بحرفية عمانية أصيلة.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 py-4 border-y border-gold/10 mb-8 sm:mb-10">
          <div className="hidden lg:block text-sm font-light text-taupe">
            عرض <span className="font-bold text-[#2A1A17]">{filteredProducts.length}</span> من أصل {products.length} منتج
          </div>

          {/* Mobile Toolbar (Search + Actions) */}
          <div className="flex flex-col lg:hidden gap-3 w-full">
            {/* Mobile Search */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم المنتج..."
                className="w-full pl-10 pr-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-xs text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm"
              />
              <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter & Sort Row */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-none border border-gold/20 bg-transparent text-xs font-bold text-[#2A1A17]"
              >
                <Filter className="w-4 h-4 text-gold" />
                <span>تصفية</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold text-[#2A1A17] flex items-center justify-center text-[10px] ml-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex-1 relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none flex items-center justify-center gap-2 py-3 px-4 rounded-none border border-gold/20 bg-transparent text-xs font-bold text-[#2A1A17] focus:outline-none text-center"
                  dir="rtl"
                >
                  <option value="featured">المميز أولاً</option>
                  <option value="newest">الأحدث وصولاً</option>
                  <option value="price-low">السعر: من الأقل للأعلى</option>
                  <option value="price-high">السعر: من الأعلى للأقل</option>
                  <option value="rating">الأعلى تقييماً</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-gold absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Desktop Sort */}
          <div className="hidden lg:flex items-center justify-end w-full gap-3 -mt-10">
            <span className="text-xs text-taupe font-bold">ترتيب حسب:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border-b border-gold/30 pl-8 pr-2 py-1 text-sm text-[#2A1A17] font-bold focus:outline-none focus:border-gold transition-colors cursor-pointer"
              >
                <option value="featured">المميز أولاً</option>
                <option value="newest">الأحدث وصولاً</option>
                <option value="price-low">السعر: من الأقل</option>
                <option value="price-high">السعر: من الأعلى</option>
                <option value="rating">التقييم</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gold absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-10 pr-4">
              
              {/* Search */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المنتج..."
                    className="w-full pl-10 pr-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm"
                  />
                  <Search className="w-4 h-4 text-gold absolute left-2 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold text-[#2A1A17] mb-4">التصنيفات</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="w-full flex items-center justify-between group"
                  >
                    <span className={`text-sm transition-colors ${selectedCategory === "" ? "font-bold text-[#2A1A17]" : "font-light text-taupe group-hover:text-[#2A1A17]"}`}>
                      جميع المنتجات
                    </span>
                    {selectedCategory === "" && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="w-full flex items-center justify-between group"
                    >
                      <span className={`text-sm transition-colors ${selectedCategory === cat.id ? "font-bold text-[#2A1A17]" : "font-light text-taupe group-hover:text-[#2A1A17]"}`}>
                        {cat.name_ar}
                      </span>
                      {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold text-[#2A1A17] mb-4 flex items-center justify-between">
                  <span>السعر الأقصى</span>
                  <span className="text-gold font-black">{maxPrice} ر.ع</span>
                </h3>
                <input
                  type="range"
                  min={100}
                  max={600}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-gold h-1 bg-gold/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#2A1A17] [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-sm font-bold text-[#2A1A17] mb-4">الحجم</h3>
                <div className="flex flex-wrap gap-2">
                  {["50ml", "100ml", "150ml"].map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-1.5 rounded-none text-xs font-bold border transition-all ${
                        selectedSizes.includes(size)
                          ? "bg-[#2A1A17] text-cream border-[#2A1A17]"
                          : "bg-transparent text-taupe border-gold/30 hover:border-gold"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-gold border-b border-gold/30 hover:border-gold pb-0.5 transition-all"
                >
                  مسح جميع الفلاتر
                </button>
              )}

            </div>
          </aside>

          {/* Product Results */}
          <main className="lg:col-span-9">
            {/* Active Filter Chips (Desktop) */}
            {activeFiltersCount > 0 && (
              <div className="hidden lg:flex flex-wrap gap-2 mb-6">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] border border-gold/20 text-xs text-[#2A1A17] rounded-none">
                    {categories.find(c => c.id === selectedCategory)?.name_ar}
                    <button onClick={() => setSelectedCategory("")}><X className="w-3 h-3 hover:text-burgundy" /></button>
                  </span>
                )}
                {maxPrice < 600 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] border border-gold/20 text-xs text-[#2A1A17] rounded-none">
                    أقل من {maxPrice} ر.ع
                    <button onClick={() => setMaxPrice(600)}><X className="w-3 h-3 hover:text-burgundy" /></button>
                  </span>
                )}
                {selectedSizes.map(size => (
                  <span key={size} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF8F5] border border-gold/20 text-xs text-[#2A1A17] rounded-none">
                    {size}
                    <button onClick={() => toggleSize(size)}><X className="w-3 h-3 hover:text-burgundy" /></button>
                  </span>
                ))}
              </div>
            )}

            {loading ? (
              // Loading Skeletons
              <div className="grid grid-cols-2 max-[360px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12 lg:gap-y-16">
                {[...Array(6)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              // Empty State
              <div className="text-center py-24 px-4 bg-[#FAF8F5] border border-gold/10 rounded-t-full">
                <Sparkles className="w-8 h-8 text-gold/40 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#2A1A17] mb-2 font-alexandria">لم نجد منتجات مطابقة</h3>
                <p className="text-sm font-light text-taupe max-w-sm mx-auto mb-8">
                  يبدو أنه لا توجد عطور تتطابق مع معايير البحث الحالية. جرب تعديل الفلاتر أو تصفح مجموعتنا الكاملة.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-[#2A1A17] text-cream text-xs font-bold hover:bg-gold transition-colors"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : (
              // Products Grid
              <div className="grid grid-cols-2 max-[360px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12 lg:gap-y-16">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative bg-[#FFFDF8] w-full max-h-[85vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
            {/* Sheet Header */}
            <div className="flex items-center justify-between p-6 border-b border-gold/10">
              <h3 className="text-lg font-bold text-[#2A1A17] font-alexandria">تصفية المنتجات</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 -m-2 text-taupe hover:text-[#2A1A17] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-8 flex-grow">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-bold text-[#2A1A17] mb-4">التصنيفات</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-4 py-2 text-xs font-bold border transition-colors ${
                      selectedCategory === ""
                        ? "bg-[#2A1A17] text-cream border-[#2A1A17]"
                        : "bg-transparent text-taupe border-gold/30"
                    }`}
                  >
                    الكل
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`px-4 py-2 text-xs font-bold border transition-colors ${
                        selectedCategory === c.id
                          ? "bg-[#2A1A17] text-cream border-[#2A1A17]"
                          : "bg-transparent text-taupe border-gold/30"
                      }`}
                    >
                      {c.name_ar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center justify-between text-sm font-bold text-[#2A1A17] mb-4">
                  <span>السعر الأقصى</span>
                  <span className="text-gold">{maxPrice} ر.ع</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={600}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-gold h-1 bg-gold/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#2A1A17] [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-sm font-bold text-[#2A1A17] mb-4">الحجم</h4>
                <div className="flex flex-wrap gap-2">
                  {["50ml", "100ml", "150ml"].map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-5 py-2 text-xs font-bold border transition-colors ${
                        selectedSizes.includes(size)
                          ? "bg-[#2A1A17] text-cream border-[#2A1A17]"
                          : "bg-transparent text-taupe border-gold/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Actions */}
            <div className="p-4 border-t border-gold/10 bg-[#FFFDF8] flex gap-3 sticky bottom-0 z-10 pb-8 sm:pb-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3.5 bg-[#2A1A17] text-cream font-bold text-xs shadow-md transition-colors hover:bg-gold"
              >
                عرض {filteredProducts.length} نتيجة
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3.5 border border-gold/30 text-taupe hover:text-[#2A1A17] font-bold text-xs transition-colors"
                >
                  مسح
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
