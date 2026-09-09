import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";
import type { Product } from "../lib/types";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { wishlist, formatPrice } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*, category:categories(name_ar, name_en), product_images(*), product_variants(*)")
          .in("id", wishlist);

        if (data && !error) {
          setProducts(data as Product[]);
        }
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlistProducts();
  }, [wishlist]);

  if (loading) {
    return (
      <div className="min-h-[60vh] py-20 text-center flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-burgundy">جاري استرجاع قائمتك المفضلة...</p>
      </div>
    );
  }

  if (wishlist.length === 0 || products.length === 0) {
    return (
      <div className="min-h-[60vh] py-16 sm:py-20 max-w-md mx-auto px-4 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-beige/60 border border-gold/30 flex items-center justify-center mb-6">
          <Heart className="w-8 h-8 text-gold-dark" />
        </div>
        <h2 className="text-2xl font-bold text-burgundy mb-2">قائمتك المفضلة فارغة</h2>
        <p className="text-xs text-darkText/70 mb-6">
          احفظ العطور التي تثير إعجابك للرجوع إليها وشرائها في أي وقت.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 rounded-full bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold flex items-center gap-2"
        >
          <span>تصفح العطور الآن</span>
          <ArrowLeft className="w-4 h-4 text-gold" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b border-gold/20 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-burgundy font-alexandria">
            العطور المفضلة
          </h1>
          <p className="text-xs text-darkText/60 mt-1">
            لديك {products.length} عطور محفوظة في مفضلتك
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
