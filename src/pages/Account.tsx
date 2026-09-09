import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronLeft,
  ExternalLink,
  MessageCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";
import type { Order, Address } from "../lib/types";
import ProductCard from "../components/ProductCard";

export default function Account() {
  const { user, profile, refreshProfile, signOut, formatPrice, settings, showToast, wishlist } =
    useStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "orders";

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Address modal form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    city: "الرياض",
    area: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth", { state: { from: { pathname: "/account" } } });
      return;
    }

    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setCity(profile.city || "");
    }

    async function loadAccountData() {
      try {
        setLoading(true);
        const [ordersRes, addrRes] = await Promise.all([
          supabase
            .from("orders")
            .select("*, order_items(*)")
            .eq("user_id", user?.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user?.id)
            .order("is_default", { ascending: false }),
        ]);

        if (ordersRes.data) setOrders(ordersRes.data as Order[]);
        if (addrRes.data) setAddresses(addrRes.data as Address[]);
      } catch (e) {
        console.error("Error loading account data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAccountData();
  }, [user, profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          city: city.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      showToast("تم تحديث بياناتك الشخصية بنجاح");
      await refreshProfile();
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء حفظ البيانات", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert({
          user_id: user.id,
          full_name: newAddress.fullName.trim(),
          phone: newAddress.phone.trim(),
          city: newAddress.city,
          area: newAddress.area.trim() || null,
          address: newAddress.address.trim(),
          notes: newAddress.notes.trim() || null,
          is_default: addresses.length === 0,
        })
        .select()
        .single();

      if (error) throw error;
      showToast("تمت إضافة العنوان الجديد بنجاح");
      setAddresses((prev) => [data as Address, ...prev]);
      setShowAddressModal(false);
      setNewAddress({
        fullName: "",
        phone: "",
        city: "الرياض",
        area: "",
        address: "",
        notes: "",
      });
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء إضافة العنوان", "error");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await supabase.from("addresses").delete().eq("id", id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast("تم حذف العنوان", "info");
    } catch {
      showToast("تعذر حذف العنوان", "error");
    }
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: "جديد", color: "bg-blue-100 text-blue-800" },
    contacted: { label: "تم التواصل", color: "bg-amber-100 text-amber-800" },
    processing: { label: "قيد التجهيز", color: "bg-purple-100 text-purple-800" },
    shipped: { label: "تم الشحن", color: "bg-indigo-100 text-indigo-800" },
    delivered: { label: "تم التسليم", color: "bg-emerald-100 text-emerald-800" },
    cancelled: { label: "ملغي", color: "bg-red-100 text-red-800" },
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-dark to-burgundy text-cream rounded-3xl p-8 sm:p-10 mb-10 shadow-luxury border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center text-2xl font-bold text-gold font-serif">
            {profile?.full_name ? profile.full_name[0] : "أ"}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-gold font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>عضو نادي أرياف للنخبة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-alexandria">
              مرحباً، {profile?.full_name || "ضيفنا العزيز"}
            </h1>
            <p className="text-xs text-cream/70 mt-1">{user.email}</p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-gold/30 text-xs font-bold text-cream flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4 text-gold-soft" />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (3 Columns) */}
        <aside className="lg:col-span-3 bg-white rounded-3xl p-4 border border-gold/25 shadow-card space-y-1">
          {[
            { id: "orders", label: "طلباتي السابقة", icon: Package },
            { id: "profile", label: "البيانات الشخصية", icon: User },
            { id: "addresses", label: "العناوين المسجلة", icon: MapPin },
            { id: "wishlist", label: "قائمة أمنياتي", icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                  active
                    ? "bg-burgundy text-cream shadow-sm"
                    : "text-darkText/70 hover:bg-beige"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-gold-soft" : "text-darkText/50"}`} />
                  <span>{tab.label}</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}
        </aside>

        {/* Tab Content Body (9 Columns) */}
        <main className="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-gold/25 shadow-card min-h-[450px]">
          {/* 1. ORDERS TAB */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-xl font-bold text-burgundy border-b border-graySoft pb-4 mb-6">
                سجل الطلبات
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-16 text-darkText/60">
                  <Package className="w-12 h-12 text-gold/40 mx-auto mb-3" />
                  <p className="text-sm font-bold text-burgundy">لا توجد طلبات سابقة حتى الآن</p>
                  <p className="text-xs text-darkText/60 mt-1 mb-6">
                    استمتع بتجربة تسوق فريدة وتصفح مجموعتنا الحصرية من العطور.
                  </p>
                  <Link
                    to="/shop"
                    className="px-6 py-2.5 rounded-full bg-burgundy text-cream text-xs font-bold shadow-md"
                  >
                    تسوق الآن
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => {
                    const st = statusLabels[o.status] || {
                      label: o.status,
                      color: "bg-gray-100 text-gray-800",
                    };
                    return (
                      <div
                        key={o.id}
                        className="p-5 rounded-2xl bg-beige/30 border border-gold/20 hover:border-gold transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-black text-sm text-burgundy">
                              {o.order_number}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs text-darkText/60">
                            تاريخ الطلب: {new Date(o.created_at).toLocaleDateString("ar-SA")}
                          </p>
                          <p className="text-xs font-bold text-burgundy mt-1">
                            الإجمالي: {formatPrice(o.total_amount)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-4 py-2 rounded-xl bg-white border border-gold/40 text-burgundy hover:bg-burgundy hover:text-cream text-xs font-bold transition-colors shadow-sm"
                          >
                            تفاصيل الطلب
                          </button>

                          <a
                            href={`https://wa.me/${settings.whatsapp.number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `مرحباً، أود الاستفسار عن حالة طلبي رقم: ${o.order_number}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="تتبع عبر واتساب"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. PROFILE TAB */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-xl font-bold text-burgundy border-b border-graySoft pb-4 mb-6">
                تعديل البيانات الشخصية
              </h2>

              <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-4">
                <div>
                  <label className="block text-xs font-bold text-darkText mb-1.5">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-darkText mb-1.5">رقم الجوال</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-darkText mb-1.5">المدينة</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="الرياض"
                    className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-3 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-all"
                  >
                    {savingProfile ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <div>
              <div className="flex items-center justify-between border-b border-graySoft pb-4 mb-6">
                <h2 className="text-xl font-bold text-burgundy">العناوين المحفوظة</h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="px-4 py-2 rounded-xl bg-burgundy text-cream text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4 text-gold" />
                  <span>إضافة عنوان</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-16 text-darkText/60">
                  <MapPin className="w-10 h-10 text-gold/40 mx-auto mb-2" />
                  <p className="text-sm font-bold text-burgundy">لم تسجل أي عناوين بعد</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="p-5 rounded-2xl bg-beige/30 border border-gold/30 relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-burgundy">{a.full_name}</h4>
                          {a.is_default && (
                            <span className="px-2 py-0.5 rounded-full bg-gold text-burgundy-dark font-bold text-[9px]">
                              افتراضي
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-darkText/70">{a.phone}</p>
                        <p className="text-xs text-darkText/80 mt-2 font-medium">
                          {a.city} {a.area ? `، ${a.area}` : ""} - {a.address}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-graySoft flex items-center justify-end">
                        <button
                          onClick={() => handleDeleteAddress(a.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 text-xs flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div>
              <h2 className="text-xl font-bold text-burgundy border-b border-graySoft pb-4 mb-6">
                قائمة الأمنيات
              </h2>
              <p className="text-xs text-darkText/70 mb-6">
                يمكنك الاطلاع على قائمة مفضلتك الكاملة من صفحة المفضلة المخصصة.
              </p>
              <Link
                to="/wishlist"
                className="px-6 py-2.5 rounded-xl bg-burgundy text-cream text-xs font-bold inline-block"
              >
                الانتقال إلى صفحة المفضلة ({wishlist.length})
              </Link>
            </div>
          )}
        </main>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-gold/40 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-graySoft pb-4 mb-6">
              <div>
                <span className="text-xs text-darkText/60 block">تفاصيل الطلب</span>
                <h3 className="text-lg font-black text-burgundy font-mono">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-darkText/50 hover:text-burgundy"
              >
                ✕
              </button>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-6 divide-y divide-graySoft/60">
              {selectedOrder.order_items?.map((item: any) => (
                <div key={item.id} className="pt-2 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-darkText">{item.product_name}</p>
                    <p className="text-[10px] text-darkText/60">
                      الحجم: {item.variant_name || "100ml"} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-burgundy">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-4 rounded-2xl bg-white border border-gold/20 text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>الخصم:</span>
                  <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>الشحن:</span>
                <span>{formatPrice(selectedOrder.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-burgundy pt-2 border-t border-graySoft">
                <span>الإجمالي:</span>
                <span>{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <a
                href={`https://wa.me/${settings.whatsapp.number.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `السلام عليكم، أود متابعة طلبي رقم: ${selectedOrder.order_number}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>متابعة عبر واتساب</span>
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-3 rounded-xl border border-gold/40 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gold/40 shadow-2xl">
            <h3 className="text-lg font-bold text-burgundy mb-4">إضافة عنوان جديد</h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-darkText mb-1">اسم المستلم</label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  placeholder="محمد السبيعي"
                  className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-darkText mb-1">رقم الجوال</label>
                <input
                  type="tel"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  placeholder="0501234567"
                  className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white text-xs outline-none text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-darkText mb-1">المدينة</label>
                <input
                  type="text"
                  required
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="الرياض"
                  className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-darkText mb-1">الحي</label>
                <input
                  type="text"
                  value={newAddress.area}
                  onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                  placeholder="حي النرجس"
                  className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-darkText mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  required
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  placeholder="شارع الأمير سلطان، عمارة 4"
                  className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white text-xs outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-burgundy text-cream font-bold text-xs shadow-gold"
                >
                  حفظ العنوان
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-5 py-3 rounded-xl border border-gold/40 text-xs font-semibold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
