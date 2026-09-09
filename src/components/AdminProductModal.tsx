import React, { useState } from "react";
import { X, Upload, Plus, Trash2, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Product, Category } from "../lib/types";

interface AdminProductModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdminProductModal({
  product,
  categories,
  isOpen,
  onClose,
  onSaved,
}: AdminProductModalProps) {
  if (!isOpen) return null;

  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name_ar: product?.name_ar || "",
    name_en: product?.name_en || "",
    slug: product?.slug || "",
    short_description: product?.short_description || "",
    description: product?.description || "",
    category_id: product?.category_id || (categories[0]?.id || ""),
    price: product?.price || 45,
    sale_price: product?.sale_price || 35,
    sku: product?.sku || `ARY-${Date.now().toString().slice(-4)}`,
    stock_quantity: product?.stock_quantity || 30,
    low_stock_threshold: product?.low_stock_threshold || 5,
    is_featured: product?.is_featured ?? true,
    is_best_seller: product?.is_best_seller ?? false,
    is_new: product?.is_new ?? true,
    is_active: product?.is_active ?? true,
  });

  const [imageUrl, setImageUrl] = useState(
    product?.product_images?.[0]?.image_url ||
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85"
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle image upload to Supabase storage `products` bucket
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (err: any) {
      alert("تعذر رفع الصورة: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        stock_quantity: Number(formData.stock_quantity),
        low_stock_threshold: Number(formData.low_stock_threshold),
        updated_at: new Date().toISOString(),
      };

      let productId = product?.id;

      if (isEditing && productId) {
        await supabase.from("products").update(payload).eq("id", productId);
      } else {
        const { data: newProd, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        productId = newProd.id;
      }

      // Ensure image is linked in product_images
      if (productId && imageUrl) {
        await supabase.from("product_images").upsert(
          {
            product_id: productId,
            image_url: imageUrl,
            is_primary: true,
            display_order: 1,
          },
          { onConflict: "product_id" }
        );
      }

      onSaved();
      onClose();
    } catch (err: any) {
      alert("حدث خطأ أثناء حفظ العطر: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cream rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gold/40 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-graySoft pb-4 mb-6">
          <h3 className="text-lg font-black text-burgundy">
            {isEditing ? "تعديل بيانات العطر" : "إضافة عطر فاخر جديد"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-darkText/50 hover:text-burgundy">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-darkText mb-1">اسم العطر بالعربية</label>
              <input
                type="text"
                required
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                placeholder="أرياف رين"
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">اسم العطر بالإنجليزية</label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="ARAYAF RAIN"
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-serif"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-darkText mb-1">الرابط الفريد (Slug)</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="arayaf-rain"
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">التصنيف</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-darkText mb-1">السعر الأصلي (ر.ع)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">سعر العرض (ر.ع)</label>
              <input
                type="number"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">الكمية بالمخزن</label>
              <input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-darkText mb-1">رمز SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white font-mono"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block font-bold text-darkText mb-1">الوصف المختصر</label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-darkText mb-1">الوصف الكامل</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white"
            />
          </div>

          {/* Image Upload & Preview */}
          <div>
            <label className="block font-bold text-darkText mb-1">صورة العطر الرئيسية</label>
            <div className="flex items-center gap-4">
              <img
                src={imageUrl}
                alt="معاينة"
                className="w-16 h-16 object-contain rounded-xl border border-gold/30 bg-white p-1"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="أو أدخل رابط الصورة المباشر"
                  className="w-full px-3 py-2 rounded-xl border border-gold/30 bg-white mb-2"
                />
                <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-beige border border-gold/30 hover:bg-gold hover:text-burgundy-dark font-bold text-[11px] transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? "جاري الرفع..." : "رفع من الجهاز إلى Supabase Storage"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={formData.is_best_seller}
                onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                className="accent-burgundy"
              />
              <span>الأكثر طلباً ومبيعاً</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                className="accent-burgundy"
              />
              <span>منتج جديد</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="accent-burgundy"
              />
              <span>عطر مميز في الواجهة</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="accent-burgundy"
              />
              <span>مفعل بالمتجر</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-graySoft">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold shadow-gold text-xs"
            >
              {saving ? "جاري الحفظ..." : "حفظ بيانات العطر"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gold/40 text-xs font-semibold"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
