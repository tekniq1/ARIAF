import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Tag, Sparkles } from "lucide-react";
import { useStore } from "../lib/store";
import { supabase } from "../lib/supabase";

export default function Cart() {
  const { cart, removeFromCart, updateQty, clearCart, cartSubtotal, formatPrice, settings, showToast } =
    useStore();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: "percentage" | "fixed";
  } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  // Calculate Shipping
  const freeThreshold = settings.shipping.free_shipping_threshold || 350;
  const isFreeShipping = cartSubtotal >= freeThreshold;
  const shippingCost = cart.length === 0 ? 0 : isFreeShipping ? 0 : settings.shipping.default || 25;

  // Calculate Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discountAmount = (cartSubtotal * appliedCoupon.discount) / 100;
    } else {
      discountAmount = appliedCoupon.discount;
    }
  }

  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCheckingCoupon(true);
    try {
      const code = couponInput.trim().toUpperCase();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        showToast("كوبون الخصم غير صالح أو منتهي الصلاحية", "error");
        return;
      }

      if (data.minimum_order_amount && cartSubtotal < data.minimum_order_amount) {
        showToast(
          `الحد الأدنى لتطبيق هذا الكوبون هو ${formatPrice(data.minimum_order_amount)}`,
          "error"
        );
        return;
      }

      setAppliedCoupon({
        code: data.code,
        discount: data.discount_value,
        type: data.discount_type,
      });
      showToast(`تم تطبيق الكوبون "${data.code}" بنجاح!`);
    } catch {
      showToast("حدث خطأ أثناء فحص الكوبون", "error");
    } finally {
      setCheckingCoupon(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FFFDF8] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Sparkles className="w-10 h-10 text-gold/40 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-[#2A1A17] font-alexandria mb-4">سلتك فارغة</h2>
          <p className="text-sm text-taupe leading-relaxed font-light mb-8">
            لم تقم بإضافة أي عطور إلى سلة التسوق حتى الآن. استكشف تشكيلاتنا العطرية الفاخرة واختر ما يناسب ذوقك الرفيع.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-10 py-3.5 bg-[#2A1A17] hover:bg-gold transition-colors text-cream font-bold text-sm"
          >
            استكشاف العطور
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-32 sm:pb-20 font-cairo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20">
        
        {/* Intro */}
        <div className="mb-8 lg:mb-12 border-b border-gold/10 pb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-[#2A1A17] font-alexandria">
              سلة التسوق
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-700/70 hover:text-red-700 transition-colors"
          >
            إفراغ السلة
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {cart.map((item, idx) => {
              const img =
                item.product.product_images?.find((i) => i.is_primary)?.image_url ||
                item.product.product_images?.[0]?.image_url ||
                "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80";

              return (
                <div
                  key={`${item.product.id}-${item.variantId || idx}`}
                  className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 bg-[#FAF8F5] border border-gold/10 relative"
                >
                  {/* Image */}
                  <div className="w-24 h-32 sm:w-32 sm:h-40 shrink-0 bg-[#FFFDF8] border border-gold/10 p-2 mx-auto sm:mx-0">
                    <img src={img} alt={item.product.name_ar} className="w-full h-full object-contain" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="text-lg font-bold text-[#2A1A17] hover:text-gold transition-colors block mb-1 font-alexandria"
                          >
                            {item.product.name_ar}
                          </Link>
                          <p className="text-[10px] text-taupe uppercase tracking-widest font-bold">
                            {item.product.name_en}
                          </p>
                        </div>
                        {/* Remove Action (Desktop) */}
                        <button
                          onClick={() => removeFromCart(item.product.id, item.variantId)}
                          className="hidden sm:flex text-taupe hover:text-red-700 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs font-bold text-taupe">الحجم:</span>
                        <span className="text-xs font-bold text-[#2A1A17] px-2 py-0.5 bg-gold/10">
                          {item.variant?.value || "100ml"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between">
                      {/* Quantity */}
                      <div className="flex items-center border border-gold/30 bg-[#FFFDF8]">
                        <button
                          onClick={() => updateQty(item.product.id, item.variantId, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-gold/10 text-[#2A1A17] transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 py-1.5 text-xs font-bold text-[#2A1A17] border-x border-gold/30 min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.product.id, item.variantId, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-gold/10 text-[#2A1A17] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-left flex flex-col items-end">
                        <span className="text-lg font-black text-[#2A1A17]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-taupe font-light">
                            {formatPrice(item.price)} للقطعة
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                  
                  {/* Remove Action (Mobile) */}
                  <button
                    onClick={() => removeFromCart(item.product.id, item.variantId)}
                    className="sm:hidden absolute top-4 left-4 text-taupe/60 hover:text-red-700 transition-colors bg-[#FFFDF8] p-1.5 rounded-full border border-gold/10"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-[#FAF8F5] border border-gold/20 p-6 sm:p-8 lg:sticky lg:top-28">
              <h3 className="text-lg font-bold text-[#2A1A17] border-b border-gold/10 pb-4 mb-6 font-alexandria">
                ملخص الطلب
              </h3>

              {/* Coupon */}
              <form onSubmit={handleApplyCoupon} className="mb-8">
                <label className="block text-xs font-bold text-[#2A1A17] mb-2">رمز القسيمة الشرائية</label>
                <div className="flex">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="أدخل الرمز هنا"
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-gold/30 text-sm focus:border-gold focus:outline-none rounded-none uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    disabled={checkingCoupon}
                    className="px-6 py-2.5 bg-[#2A1A17] text-cream font-bold text-xs hover:bg-gold transition-colors rounded-none whitespace-nowrap"
                  >
                    {checkingCoupon ? "..." : "تطبيق"}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-2">
                    <Tag className="w-3 h-3" />
                    تم تطبيق الخصم ({appliedCoupon.code})
                  </p>
                )}
              </form>

              {/* Breakdown */}
              <div className="space-y-4 text-sm font-light text-taupe">
                <div className="flex items-center justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-[#2A1A17]">{formatPrice(cartSubtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>خصم القسيمة</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>رسوم التوصيل</span>
                  <span className="font-bold text-[#2A1A17]">
                    {shippingCost === 0 ? "مجاني" : formatPrice(shippingCost)}
                  </span>
                </div>

                {!isFreeShipping && (
                  <div className="pt-2 text-[10px] text-[#2A1A17]">
                    أضف منتجات بقيمة <strong>{formatPrice(freeThreshold - cartSubtotal)}</strong> لتحصل على شحن مجاني لكافة الوجهات!
                  </div>
                )}

                <div className="pt-6 mt-4 border-t border-gold/10 flex items-center justify-between">
                  <span className="text-base font-bold text-[#2A1A17]">الإجمالي</span>
                  <span className="text-2xl font-black text-[#2A1A17]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Desktop Checkout CTA */}
              <div className="hidden sm:block mt-8">
                <button
                  onClick={() =>
                    navigate("/checkout", {
                      state: {
                        couponCode: appliedCoupon?.code,
                        discountAmount,
                        shippingCost,
                      },
                    })
                  }
                  className="w-full py-4 bg-[#2A1A17] hover:bg-gold text-cream font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  <span>إتمام الطلب</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#FFFDF8] border-t border-gold/20 p-4 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-xs font-bold text-taupe">الإجمالي:</span>
          <span className="text-lg font-black text-[#2A1A17]">{formatPrice(grandTotal)}</span>
        </div>
        <button
          onClick={() =>
            navigate("/checkout", {
              state: {
                couponCode: appliedCoupon?.code,
                discountAmount,
                shippingCost,
              },
            })
          }
          className="w-full py-3.5 bg-[#2A1A17] text-cream font-bold text-sm tracking-wide flex items-center justify-center gap-2"
        >
          <span>إتمام الطلب</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
