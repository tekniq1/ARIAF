import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MessageCircle,
  Building2,
  CheckCircle2,
  MapPin,
  Copy,
  Check,
  Building,
  Info
} from "lucide-react";
import { useStore } from "../lib/store";
import { supabase } from "../lib/supabase";

export default function Checkout() {
  const { cart, clearCart, cartSubtotal, formatPrice, settings, user, profile, showToast } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const passedState = location.state as
    | { couponCode?: string; discountAmount?: number; shippingCost?: number }
    | undefined;

  // Form State
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
    email: profile?.email || user?.email || "",
    country: "سلطنة عُمان",
    city: profile?.city || "صلالة (محافظة ظفار)",
    area: "",
    address: "",
    notes: "",
  });

  // GPS Location State
  const [locating, setLocating] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationUrl, setLocationUrl] = useState<string>("");

  // Bank Transfer & Receipt Proof State
  const [transferRef, setTransferRef] = useState("");
  const [selectedBankId, setSelectedBankId] = useState<string>("bank-1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState<"home" | "pickup">("home");
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "bank">("whatsapp");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Totals calculation
  const defaultShipping = settings.shipping.default || 2;
  const freeThreshold = settings.shipping.free_shipping_threshold || 25;
  const isFree = cartSubtotal >= freeThreshold || deliveryMethod === "pickup";
  const shippingCost = isFree ? 0 : passedState?.shippingCost ?? defaultShipping;
  const discountAmount = passedState?.discountAmount || 0;
  const couponCode = passedState?.couponCode || null;

  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  // Oman Governorates & Wilayats
  const omanWilayats = [
    "صلالة (محافظة ظفار)",
    "مسقط", "السيب", "بوشر", "مطرح", "العامرات", "صحار", "نزوى", "صور", "الرستاق",
    "البريمي", "عبري", "بركاء", "السويق", "بهلاء", "طاقة", "مرباط", "خصب (محافظة مسندم)",
    "هيماء (محافظة الوسطى)", "شناص", "لوى", "صحم", "الخابورة", "المصنعة", "بدية", "إبراء",
    "جعلان بني بو علي", "سمائل", "أدم",
  ];

  // Force strict bank accounts to ensure user requested data
  const bankAccounts = [
    {
      id: "bank-1",
      bank_name: "حساب محلي داخل سلطنة عُمان",
      account_holder: "LAILA MURAD SALEH SAID AL SHAUSHI",
      account_number: "0397054283770013",
      iban: "OM430270397054283770013",
    },
    {
      id: "bank-2",
      bank_name: "اليمن - بنك الكريمي (ريال يمني)",
      account_holder: "حساب جاري",
      account_number: "3000627495",
      iban: "",
    },
    {
      id: "bank-3",
      bank_name: "اليمن - بنك الكريمي (ريال سعودي)",
      account_holder: "حساب جاري",
      account_number: "3000627500",
      iban: "",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // GPS Auto-detect location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast("خاصية تحديد الموقع غير مدعومة في متصفحك", "error");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
        setLocationCoords({ lat, lng });
        setLocationUrl(mapLink);
        setLocating(false);
        showToast("تم تحديد موقعك الجغرافي بنجاح عبر GPS!");
      },
      (err) => {
        console.error("GPS error:", err);
        setLocating(false);
        showToast("تعذر تحديد الموقع تلقائياً. يرجى إدخال العنوان يدوياً", "info");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`تم النسخ بنجاح`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("سلة المشتريات فارغة", "error");
      navigate("/shop");
      return;
    }

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showToast("يرجى ملء جميع الحقول الإلزامية (الاسم، الهاتف، العنوان)", "error");
      return;
    }

    const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);

    setIsSubmitting(true);
    try {
      const year = new Date().getFullYear();
      const randomFive = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `ARY-${year}-${randomFive}`;

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: formData.fullName.trim(),
          customer_phone: formData.phone.trim(),
          customer_email: formData.email.trim() || null,
          city: formData.city,
          area: formData.area.trim() || null,
          address: formData.address.trim(),
          notes: formData.notes.trim() || null,
          delivery_method: deliveryMethod,
          payment_method: paymentMethod,
          subtotal: cartSubtotal,
          discount_amount: discountAmount,
          shipping_cost: shippingCost,
          total_amount: grandTotal,
          coupon_code: couponCode,
          status: "new",
          whatsapp_sent: false,
        })
        .select("id, order_number")
        .single();

      if (orderError || !orderData) {
        throw new Error(orderError?.message || "فشل تسجيل الطلب");
      }

      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        variant_id: item.variantId || null,
        product_name: item.product.name_ar,
        variant_name: item.variant?.value || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) console.error("Order items error:", itemsError);

      for (const item of cart) {
        const newProdStock = Math.max(0, item.product.stock_quantity - item.quantity);
        await supabase.from("products").update({ stock_quantity: newProdStock }).eq("id", item.product.id);

        if (item.variantId) {
          const curVarStock = item.variant?.stock_quantity ?? item.product.stock_quantity;
          const newVarStock = Math.max(0, curVarStock - item.quantity);
          await supabase.from("product_variants").update({ stock_quantity: newVarStock }).eq("id", item.variantId);
        }
      }

      const rawWhatsApp = "77414193"; // Using strict requested whatsapp number
      const itemsText = cart
        .map(
          (it, idx) =>
            `${idx + 1}. *${it.product.name_ar}* (${it.variant?.value || "100ml"}) × ${it.quantity} = ${it.price * it.quantity} ر.ع`
        )
        .join("\n");

      let whatsappMsg = `*🇴🇲 طلب جديد من دار أرياف للعطور*
━━━━━━━━━━━━━━━━━━
🔖 *رقم الطلب:* \`${orderNumber}\`
👤 *العميل:* ${formData.fullName.trim()}
📱 *الهاتف:* ${formData.phone.trim()}
🌍 *الدولة:* ${formData.country}
📍 *الولاية والمدينة:* ${formData.city}
🏡 *العنوان التفصيلي:* ${formData.address.trim()} ${formData.area ? `(${formData.area.trim()})` : ""}
${locationUrl ? `🗺️ *رابط الموقع (GPS):* ${locationUrl}\n` : ""}${formData.notes ? `📝 *ملاحظات:* ${formData.notes.trim()}\n` : ""}━━━━━━━━━━━━━━━━━━
🛍️ *تفاصيل العطور المطلوبة:*
${itemsText}

━━━━━━━━━━━━━━━━━━
💵 *المجموع الفرعي:* ${cartSubtotal} ر.ع
${discountAmount > 0 ? `🏷️ *خصم الكوبون:* -${discountAmount} ر.ع\n` : ""}🚚 *رسوم التوصيل:* ${shippingCost === 0 ? "مجاني" : `${shippingCost} ر.ع`}
💰 *الإجمالي المستحق:* *${grandTotal} ر.ع*

💳 *طريقة الدفع:* ${
        paymentMethod === "whatsapp"
          ? "تأكيد واستكمال عبر الواتساب"
          : `تحويل بنكي (${selectedBank?.bank_name || "بنك محلي"})`
      }
${paymentMethod === "bank" && transferRef ? `🔢 *رقم الحوالة/العملية:* \`${transferRef}\`\n` : ""}${paymentMethod === "bank" ? `🧾 *إشعار التحويل:* يرجى إرفاق صورة الإشعار في هذه المحادثة\n` : ""}━━━━━━━━━━━━━━━━━━
_شكراً لاختياركم أرياف - صلالة_ ✨`;

      clearCart();

      const waUrl = `https://wa.me/${rawWhatsApp}?text=${encodeURIComponent(whatsappMsg)}`;
      window.open(waUrl, "_blank");

      navigate(`/order-confirmation/${orderData.order_number}`, {
        state: {
          order: {
            ...orderData,
            customer_name: formData.fullName,
            customer_phone: formData.phone,
            city: formData.city,
            address: formData.address,
            total_amount: grandTotal,
            delivery_method: deliveryMethod,
            payment_method: paymentMethod,
            location_url: locationUrl,
            transfer_reference: transferRef,
            items: cart,
          },
        },
      });
    } catch (err: any) {
      console.error("Order creation failed:", err);
      showToast(err.message || "حدث خطأ أثناء تأكيد الطلب، يرجى المحاولة ثانية", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] bg-[#FFFDF8] flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-[#2A1A17] font-alexandria mb-4">سلتك فارغة</h2>
          <Link to="/shop" className="text-sm font-bold text-taupe hover:text-gold transition-colors">
            استكشف العطور ←
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-32 sm:pb-20 font-cairo">
      {/* Visual Progress Header */}
      <div className="bg-[#2A1A17] pt-12 sm:pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold text-cream/50 relative">
            <div className="flex items-center gap-2 text-gold">
              <span className="w-6 h-6 rounded-full bg-gold text-[#2A1A17] flex items-center justify-center text-xs">1</span>
              <span>البيانات</span>
            </div>
            <div className="flex-1 h-px bg-gold/20 max-w-[50px] sm:max-w-[100px]" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full border border-cream/20 flex items-center justify-center text-xs">2</span>
              <span>الدفع</span>
            </div>
            <div className="flex-1 h-px bg-gold/20 max-w-[50px] sm:max-w-[100px]" />
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full border border-cream/20 flex items-center justify-center text-xs">3</span>
              <span>التأكيد</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
          
          {/* Main Form Fields */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Customer Information */}
            <div className="bg-[#FAF8F5] p-6 sm:p-8 shadow-sm border border-gold/10 rounded-2xl">
              <h2 className="text-xl font-bold text-[#2A1A17] mb-6 font-alexandria flex items-center justify-between">
                <span>بيانات العميل</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="سالم بن أحمد"
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">رقم الهاتف <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="77414193"
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm text-left"
                    dir="ltr"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@mail.com"
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* 2. Location */}
            <div className="bg-[#FAF8F5] p-6 sm:p-8 shadow-sm border border-gold/10 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-[#2A1A17] font-alexandria">موقع التوصيل</h2>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="px-5 py-2.5 bg-gold/10 hover:bg-gold/20 text-[#2A1A17] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-gold/20 rounded-xl"
                >
                  <MapPin className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
                  <span>{locating ? "جاري التحديد..." : "تحديد موقعي (GPS)"}</span>
                </button>
              </div>

              {locationUrl && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-emerald-900 mb-1">تم حفظ الموقع الجغرافي بنجاح</p>
                    <a href={locationUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 underline">عرض على الخريطة</a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">الدولة <span className="text-red-500">*</span></label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none cursor-pointer transition-all duration-300 shadow-sm"
                  >
                    <option value="سلطنة عُمان">سلطنة عُمان</option>
                    <option value="دول الخليج العربي">دول الخليج العربي</option>
                    <option value="أخرى">دول أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">المدينة / الولاية <span className="text-red-500">*</span></label>
                  {formData.country === "سلطنة عُمان" ? (
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none cursor-pointer transition-all duration-300 shadow-sm"
                    >
                      {omanWilayats.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="اسم المدينة"
                      className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">الحي / المنطقة</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="مثال: الدهاريز"
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">العنوان التفصيلي <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="الشارع، رقم المبنى"
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#2A1A17] mb-2">ملاحظات التوصيل</label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="أي ملاحظات تفيد المندوب..."
                    className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm resize-y"
                  />
                </div>
              </div>
            </div>

            {/* 3. Delivery Method */}
            <div className="bg-[#FAF8F5] p-6 sm:p-8 shadow-sm border border-gold/10 rounded-2xl">
              <h2 className="text-xl font-bold text-[#2A1A17] mb-6 font-alexandria">طريقة التوصيل</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`p-5 border cursor-pointer flex items-start gap-4 transition-colors ${
                  deliveryMethod === "home" ? "border-[#2A1A17] bg-[#FFFDF8]" : "border-gold/20 bg-white"
                }`}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "home"}
                    onChange={() => setDeliveryMethod("home")}
                    className="mt-1 accent-[#2A1A17]"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-sm text-[#2A1A17] mb-1">
                      <Truck className="w-4 h-4 text-gold" />
                      <span>توصيل للمنزل</span>
                    </div>
                    <p className="text-xs text-taupe font-light leading-relaxed">توصيل سريع ومضمون إلى الوجهة المحددة.</p>
                  </div>
                </label>

                <label className={`p-5 border cursor-pointer flex items-start gap-4 transition-colors ${
                  deliveryMethod === "pickup" ? "border-[#2A1A17] bg-[#FFFDF8]" : "border-gold/20 bg-white"
                }`}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="mt-1 accent-[#2A1A17]"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-sm text-[#2A1A17] mb-1">
                      <Building2 className="w-4 h-4 text-gold" />
                      <span>استلام من الفرع</span>
                    </div>
                    <p className="text-xs text-taupe font-light leading-relaxed">استلام مباشر من بوتيك أرياف بصلالة أو مسقط.</p>
                  </div>
                </label>
              </div>

              {/* Delivery Notices */}
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-[#FFFDF8] border border-gold/10 flex items-start gap-3">
                  <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-taupe font-bold">رسوم التوصيل تُحسب على العميل حسب الوجهة.</p>
                </div>
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="bg-[#FAF8F5] p-6 sm:p-8 shadow-sm border border-gold/10 rounded-2xl">
              <h2 className="text-xl font-bold text-[#2A1A17] mb-6 font-alexandria">طريقة الدفع</h2>

              {/* Notice for Outside Oman */}
              {formData.country !== "سلطنة عُمان" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-900 font-bold">للطلبات خارج سلطنة عُمان، يجب إتمام الدفع مقدمًا قبل التسليم.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className={`p-5 border cursor-pointer flex flex-col gap-3 transition-colors ${
                  paymentMethod === "whatsapp" ? "border-[#2A1A17] bg-[#FFFDF8]" : "border-gold/20 bg-white"
                }`}>
                  <div className="flex items-center justify-between">
                    <MessageCircle className={`w-5 h-5 ${paymentMethod === "whatsapp" ? "text-emerald-600" : "text-taupe"}`} />
                    <input type="radio" checked={paymentMethod === "whatsapp"} onChange={() => setPaymentMethod("whatsapp")} className="accent-[#2A1A17]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2A1A17]">عبر واتساب</h4>
                    <p className="text-[11px] text-taupe mt-1 font-light">تأكيد مباشر</p>
                  </div>
                </label>

                <label className={`p-5 border cursor-pointer flex flex-col gap-3 transition-colors ${
                  paymentMethod === "bank" ? "border-[#2A1A17] bg-[#FFFDF8]" : "border-gold/20 bg-white"
                }`}>
                  <div className="flex items-center justify-between">
                    <CreditCard className={`w-5 h-5 ${paymentMethod === "bank" ? "text-[#2A1A17]" : "text-taupe"}`} />
                    <input type="radio" checked={paymentMethod === "bank"} onChange={() => setPaymentMethod("bank")} className="accent-[#2A1A17]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2A1A17]">تحويل بنكي</h4>
                    <p className="text-[11px] text-taupe mt-1 font-light">إيداع للحساب المعتمد</p>
                  </div>
                </label>
              </div>

              {/* Bank Details Area */}
              {paymentMethod === "bank" && (
                <div className="mt-8 space-y-6 border-t border-gold/10 pt-6">
                  {/* Bank Accounts Stack */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#2A1A17] flex items-center gap-2">
                      <Building className="w-4 h-4 text-gold" />
                      اختر الحساب البنكي للتحويل:
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {bankAccounts.map((bank) => {
                        const isSelected = selectedBankId === bank.id;
                        return (
                          <div 
                            key={bank.id} 
                            onClick={() => setSelectedBankId(bank.id)}
                            className={`border p-5 cursor-pointer transition-colors ${isSelected ? "border-[#2A1A17] bg-[#FFFDF8]" : "border-gold/20 bg-white"}`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-sm text-[#2A1A17]">{bank.bank_name}</h4>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#2A1A17]" : "border-gold/40"}`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-[#2A1A17]" />}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="text-xs text-taupe">المستفيد: <strong className="text-[#2A1A17]">{bank.account_holder}</strong></div>
                              
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 bg-[#FAF8F5] border border-gold/10 p-3 flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] text-taupe block mb-1">رقم الحساب</span>
                                    <span className="font-mono font-bold text-[#2A1A17] text-sm" dir="ltr">{bank.account_number}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleCopy(bank.account_number, `acc-${bank.id}`); }}
                                    className="p-2 text-taupe hover:text-gold transition-colors"
                                  >
                                    {copiedKey === `acc-${bank.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                </div>

                                {bank.iban && (
                                  <div className="flex-1 bg-[#FAF8F5] border border-gold/10 p-3 flex items-center justify-between overflow-hidden">
                                    <div className="truncate pr-2">
                                      <span className="text-[10px] text-taupe block mb-1">الآيبان IBAN</span>
                                      <span className="font-mono font-bold text-[#2A1A17] text-xs sm:text-sm truncate block" dir="ltr">{bank.iban}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleCopy(bank.iban, `iban-${bank.id}`); }}
                                      className="p-2 text-taupe hover:text-gold transition-colors shrink-0"
                                    >
                                      {copiedKey === `iban-${bank.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Transfer Ref */}
                  <div className="pt-4 border-t border-gold/10">
                    <label className="block text-xs font-bold text-[#2A1A17] mb-2">رقم الحوالة البنكية (اختياري)</label>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="رقم العملية / Reference"
                      className="w-full px-5 py-3.5 bg-[#FAF8F5] border border-[#2A1A17]/10 text-sm font-mono text-[#2A1A17] placeholder:text-taupe/50 rounded-xl focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 outline-none transition-all duration-300 shadow-sm text-left"
                      dir="ltr"
                    />
                    <p className="mt-2 text-xs text-taupe font-light">بعد التحويل، سيُطلب منك إرفاق صورة الإيصال مباشرةً عبر واتساب.</p>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-[#FAF8F5] border border-gold/20 p-6 sm:p-8 lg:sticky lg:top-28">
              <h3 className="text-lg font-bold text-[#2A1A17] border-b border-gold/10 pb-4 mb-6 font-alexandria">
                مراجعة الطلب
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-4 pr-2 mb-6 text-sm">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#2A1A17]">{item.product.name_ar}</p>
                      <p className="text-[10px] text-taupe font-light">
                        {item.variant?.value || "100ml"} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-[#2A1A17]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-sm font-light text-taupe border-t border-gold/10 pt-6">
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

                <div className="pt-6 mt-4 border-t border-gold/10 flex items-center justify-between">
                  <span className="text-base font-bold text-[#2A1A17]">الإجمالي للدفع</span>
                  <span className="text-2xl font-black text-[#2A1A17]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="hidden sm:block mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#2A1A17] hover:bg-gold transition-colors text-cream font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span>جارٍ تأكيد الطلب...</span>
                      <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>إتمام الطلب النهائي</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 flex items-center gap-2 justify-center text-[10px] text-taupe">
                <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                <span>معاملات مشفرة ومحمية بالكامل 🇴🇲</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Sticky Submit */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#FFFDF8] border-t border-gold/20 p-4 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-[#2A1A17] text-cream font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span>جارٍ تأكيد الطلب...</span>
              <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            </>
          ) : (
            <>
              <span>إتمام الطلب النهائي</span>
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
