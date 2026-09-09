import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import type { Product, Review, ProductVariant } from "../lib/types";
import { useStore } from "../lib/store";
import ProductCard from "../components/ProductCard";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"desc" | "notes" | "details" | "reviews">("desc");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // New review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { wishlist, toggleWishlist, addToCart, formatPrice, settings, showToast, user } = useStore();

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      try {
        setLoading(true);
        const { data: p } = await supabase
          .from("products")
          .select(
            "*, category:categories(name_ar, name_en), product_images(*), product_variants(*), perfume_notes(*)"
          )
          .eq("slug", slug)
          .single();

        if (p) {
          setProduct(p as Product);
          const firstImg =
            p.product_images?.find((img: any) => img.is_primary)?.image_url ||
            p.product_images?.[0]?.image_url ||
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85";
          setActiveImage(firstImg);

          // Set default variant if available
          if (p.product_variants && p.product_variants.length > 0) {
            setSelectedVariantId(p.product_variants[0].id);
          }

          // Fetch reviews
          const { data: revs } = await supabase
            .from("reviews")
            .select("*")
            .eq("product_id", p.id)
            .eq("status", "approved")
            .order("created_at", { ascending: false });
          if (revs) setReviews(revs as Review[]);

          // Fetch related products
          const { data: rel } = await supabase
            .from("products")
            .select("*, category:categories(name_ar, name_en), product_images(*)")
            .eq("is_active", true)
            .neq("id", p.id)
            .limit(4);
          if (rel) setRelated(rel as Product[]);
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] py-20 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-burgundy">جاري تحضير التفاصيل الملكية للعطر...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] py-20 text-center px-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-burgundy mb-3">العطر غير متوفر</h2>
        <Link to="/shop" className="text-sm text-gold-dark hover:underline font-bold">
          تصفح المتجر
        </Link>
      </div>
    );
  }

  const selectedVariant: ProductVariant | undefined = product.product_variants?.find(
    (v) => v.id === selectedVariantId
  );

  const effectiveStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const isOutOfStock = effectiveStock <= 0;

  const effectivePrice = selectedVariant
    ? (selectedVariant.sale_price ?? selectedVariant.price)
    : (product.sale_price ?? product.price);

  const originalPrice = selectedVariant ? selectedVariant.price : product.price;
  const isWishlisted = wishlist.includes(product.id);

  // WhatsApp Order message
  const handleWhatsAppOrder = () => {
    const rawNumber = settings.whatsapp.number.replace(/[^0-9]/g, "") || "96891234567";
    const variantName = selectedVariant?.value || "100ml";
    const totalAmount = effectivePrice * quantity;

    const message = `السلام عليكم ورحمة الله،
أود طلب عطر "${product.name_ar} - ${product.name_en}"
الحجم: ${variantName}
الكمية: ${quantity}
السعر الإجمالي: ${totalAmount} ر.ع

يرجى إفادتي بتأكيد الطلب وطريقة الدفع. شكراً لكم!`;

    window.open(
      `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: product.id,
        user_id: user?.id || null,
        user_name: reviewerName.trim() || user?.email?.split("@")[0] || "عميل أرياف",
        rating: newRating,
        comment: newComment.trim(),
        status: "approved",
      });

      if (!error) {
        showToast("شكراً لتقييمك الراقي! تم اعتماد رأيك بنجاح.");
        setNewComment("");
        setReviewerName("");
        // Reload reviews
        const { data: revs } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", product.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false });
        if (revs) setReviews(revs as Review[]);
      } else {
        showToast("حدث خطأ أثناء إرسال التقييم", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء إرسال التقييم", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="text-xs text-darkText/60 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-gold">الرئيسية</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-gold">المتجر</Link>
        <span>/</span>
        <span className="text-gold-dark font-bold">{product.name_ar}</span>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
        {/* Left: Gallery (6 Columns) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Visual Display with Floating 3D Physics */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-b from-beige/50 via-white to-beige/30 p-8 border border-gold/30 shadow-luxury flex items-center justify-center">
            {/* Ambient Gold Glow Background */}
            <div className="absolute inset-0 bg-radial from-gold/15 to-transparent pointer-events-none" />

            <motion.img
              key={activeImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              src={activeImage}
              alt={product.name_ar}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] select-none hover:scale-105 transition-transform duration-700"
            />

            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-1.5">
              {product.is_best_seller && (
                <span className="px-3 py-1 text-xs font-bold bg-gold text-burgundy-dark rounded-full shadow-sm">
                  الأكثر طلباً
                </span>
              )}
              {product.is_new && (
                <span className="px-3 py-1 text-xs font-bold bg-burgundy text-cream rounded-full shadow-sm">
                  جديد
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 left-4 p-3 rounded-full bg-white/80 hover:bg-white text-darkText/60 hover:text-burgundy shadow-md transition-all"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-600 text-red-600" : ""}`} />
            </button>
          </div>

          {/* Thumbnail Gallery Row */}
          {product.product_images && product.product_images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-2">
              {product.product_images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.image_url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white shrink-0 ${
                    activeImage === img.image_url
                      ? "border-gold shadow-gold"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.image_url} alt="زاوية العطر" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions (6 Columns) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gold-dark mb-1">
              <Sparkles className="w-4 h-4 text-gold" />
              <span>مجموعة أرياف الحصرية</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-burgundy font-alexandria">
              {product.name_ar}
            </h1>
            <p className="text-sm font-serif uppercase tracking-widest text-darkText/60 mt-1">
              {product.name_en}
            </p>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mt-3 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.average_rating || 5)
                        ? "fill-current text-amber-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-darkText/80">
                {product.average_rating || 5.0} ({reviews.length} تقييمات عملاء)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-beige/60 rounded-2xl p-4 border border-gold/30 flex items-baseline gap-3">
            <span className="text-3xl font-black text-burgundy">
              {formatPrice(effectivePrice)}
            </span>
            {originalPrice > effectivePrice && (
              <span className="text-sm text-darkText/50 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
              شامل ضريبة القيمة المضافة
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-darkText/75 leading-relaxed">
            {product.short_description || product.description}
          </p>

          {/* Size / Volume Variants */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-darkText mb-2.5">
                اختر الحجم:
              </label>
              <div className="flex flex-wrap gap-3">
                {product.product_variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                      selectedVariantId === v.id
                        ? "bg-burgundy text-cream border-gold shadow-gold"
                        : "bg-white text-darkText border-gold/30 hover:border-gold"
                    }`}
                  >
                    <span>{v.value}</span>
                    <span className="mr-2 text-[11px] opacity-80">
                      ({formatPrice(v.sale_price ?? v.price)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status Notification */}
          {isOutOfStock ? (
            <div className="p-4 rounded-2xl bg-neutral-900 text-cream text-xs font-bold flex items-center gap-2.5 shadow-md border border-red-500/40">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>هذا العطر غير متوفر حالياً (نفد من المخزون)</span>
            </div>
          ) : effectiveStock <= 5 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>متبقي {effectiveStock} قطع فقط في المخزون! سارع بالطلب قبل النفاد</span>
            </div>
          ) : (
            <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>متوفر في المخزون (جاهز للشحن الفوري)</span>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-darkText">الكمية:</label>
              <div className={`flex items-center border rounded-xl bg-white overflow-hidden shadow-sm ${
                isOutOfStock ? "border-gray-300 opacity-50" : "border-gold/40"
              }`}>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-beige text-darkText transition-colors disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-burgundy">{quantity}</span>
                <button
                  disabled={isOutOfStock || quantity >= effectiveStock}
                  onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                  className="p-2.5 hover:bg-beige text-darkText transition-colors disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Actions: Add to Cart & WhatsApp Order */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                disabled={isOutOfStock}
                onClick={() => !isOutOfStock && addToCart(product, selectedVariantId, quantity)}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 ${
                  isOutOfStock
                    ? "bg-neutral-200 text-neutral-500 border border-neutral-300 cursor-not-allowed"
                    : "bg-burgundy hover:bg-burgundy-light text-cream border border-gold/50 shadow-goldHover hover:shadow-gold transform active:scale-95"
                }`}
              >
                <ShoppingBag className="w-5 h-5 text-gold-soft" />
                <span>{isOutOfStock ? "المنتج غير متوفر" : "أضف إلى السلة"}</span>
              </button>

              <button
                disabled={isOutOfStock}
                onClick={() => !isOutOfStock && handleWhatsAppOrder()}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all duration-300 ${
                  isOutOfStock
                    ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white transform active:scale-95"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>{isOutOfStock ? "طلب عند التوفر" : "اطلب عبر واتساب"}</span>
              </button>
            </div>
          </div>

          {/* Guarantees Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-graySoft text-center text-[11px] text-darkText/75">
            <div className="p-3 bg-white/60 rounded-xl border border-gold/20">
              <ShieldCheck className="w-4 h-4 text-gold mx-auto mb-1" />
              <span>أصلي ومضمون 100%</span>
            </div>
            <div className="p-3 bg-white/60 rounded-xl border border-gold/20">
              <Truck className="w-4 h-4 text-gold mx-auto mb-1" />
              <span>شحن وتوصيل آمن</span>
            </div>
            <div className="p-3 bg-white/60 rounded-xl border border-gold/20">
              <RotateCcw className="w-4 h-4 text-gold mx-auto mb-1" />
              <span>ضمان الاستبدال الذهبي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Olfactory Pyramid Section */}
      {product.perfume_notes && product.perfume_notes.length > 0 && (
        <div className="mb-20 bg-white/80 rounded-3xl p-8 sm:p-12 border border-gold/30 shadow-card">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-gold-dark uppercase tracking-widest">
              توليفة العطر
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-burgundy mt-1">
              مكونات الهرم العطري
            </h2>
            <div className="w-12 h-[2px] bg-gold mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["top", "heart", "base"].map((type) => {
              const notesOfType = product.perfume_notes?.filter((n) => n.note_type === type);
              const label =
                type === "top" ? "المقدمة (الافتتاحية)" : type === "heart" ? "قلب العطر" : "قاعدة العطر";
              const noteColor =
                type === "top" ? "text-amber-700" : type === "heart" ? "text-rose-700" : "text-amber-900";

              return (
                <div
                  key={type}
                  className="bg-beige/50 rounded-2xl p-6 border border-gold/25 text-center flex flex-col items-center"
                >
                  <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${noteColor}`}>
                    {label}
                  </span>
                  <ul className="space-y-2 mt-2">
                    {notesOfType && notesOfType.length > 0 ? (
                      notesOfType.map((n) => (
                        <li key={n.id} className="text-sm font-semibold text-darkText">
                          {n.name}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-darkText/50">توليفة حصرية من الزيوت الطبيعية</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Tabs: Description, Perfume Details, Customer Reviews */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gold/30 shadow-card mb-20">
        {/* Tab Headers */}
        <div className="flex border-b border-graySoft gap-6 sm:gap-10 mb-8 overflow-x-auto">
          {[
            { id: "desc", label: "وصف المنتج" },
            { id: "details", label: "التفاصيل والمواصفات" },
            { id: "reviews", label: `آراء العملاء (${reviews.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-sm sm:text-base font-bold transition-all relative shrink-0 ${
                activeTab === tab.id ? "text-burgundy" : "text-darkText/60 hover:text-burgundy"
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gold rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === "desc" && (
          <div className="text-sm sm:text-base text-darkText/80 leading-relaxed space-y-4 max-w-3xl">
            <p>{product.description}</p>
            <p className="text-gold-dark font-serif italic">
              كل زجاجة تصنع وتعبأ بحرفية استثنائية لضمان ثبات عطري يدوم لساعات طويلة، مغلفة بعلبة فاخرة تناسب الإهداء لأغلى الناس.
            </p>
          </div>
        )}

        {activeTab === "details" && (
          <div className="max-w-2xl text-sm">
            <dl className="divide-y divide-graySoft">
              <div className="py-3 flex justify-between">
                <dt className="text-darkText/60">رمز المنتج (SKU)</dt>
                <dd className="font-bold text-darkText">{product.sku || "ARY-SIGNATURE"}</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-darkText/60">التركيز</dt>
                <dd className="font-bold text-darkText">Eau de Parfum (تركيز عالي)</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-darkText/60">بلد المنشأ</dt>
                <dd className="font-bold text-darkText">سلطنة عُمان</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-darkText/60">الفئة</dt>
                <dd className="font-bold text-darkText">{product.category?.name_ar || "عطور فاخرة"}</dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-10">
            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-darkText/60 text-center py-6">
                  كن أول من يقيّم هذا العطر الملكي وشاركنا تجربتك.
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-beige/40 border border-gold/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-burgundy">
                        {rev.user_name || "عميل أرياف"}
                      </span>
                      <div className="flex items-center text-amber-500 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-darkText/80 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Submit Review Form */}
            <div className="pt-6 border-t border-graySoft max-w-xl">
              <h4 className="text-base font-bold text-burgundy mb-4">أضف تقييمك للعطر</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-darkText mb-1.5">الاسم</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="اسمك الكريم"
                    className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-darkText mb-1.5">التقييم</label>
                  <div className="flex gap-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className={`text-lg p-1 ${
                          star <= newRating ? "text-amber-500" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-darkText mb-1.5">تعليقك</label>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب انطباعك عن ثبات العطر، فواحانه، وجمال توليفته..."
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-sm flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال التقييم</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Carousel/Grid */}
      {related.length > 0 && (
        <div>
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-gold-dark uppercase tracking-widest">
              مختارات قد تعجبك
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-burgundy mt-1">
              عطور أخرى من ذات الفخامة
            </h2>
            <div className="w-12 h-[2px] bg-gold mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
