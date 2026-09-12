import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "../lib/types";
import { useStore } from "../lib/store";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { wishlist, toggleWishlist, addToCart, formatPrice } = useStore();
  
  const isWishlisted = wishlist.includes(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const primaryImage =
    product.product_images?.find((img) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85";

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.sale_price || 0)) / product.price) * 100)
    : 0;

  // Determine Primary Badge
  let primaryBadge = null;
  if (hasDiscount) {
    primaryBadge = <span className="bg-[#2A1A17] text-cream px-2 py-1 rounded-[2px] text-[10px] font-bold tracking-widest shadow-sm">-{discountPercent}%</span>;
  } else if (product.is_best_seller) {
    primaryBadge = <span className="bg-gold text-burgundy px-2 py-1 rounded-[2px] text-[10px] font-bold tracking-widest shadow-sm">الأكثر طلباً</span>;
  } else if (product.is_new) {
    primaryBadge = <span className="bg-white/90 text-taupe px-2 py-1 rounded-[2px] text-[10px] font-bold tracking-widest shadow-sm border border-gold/10">جديد</span>;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product);
      setIsAdding(false);
    }, 600);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`group relative flex flex-col bg-transparent transition-all duration-500 ${
        isOutOfStock ? "opacity-70 grayscale-[30%]" : ""
      }`}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] bg-[#F8F5F0] mb-4 flex items-center justify-center overflow-hidden rounded-[2px] group-hover:bg-[#FAF8F5] transition-colors duration-500">
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 left-3 z-10 p-2 rounded-full bg-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-300 hover:bg-white hover:scale-110 ${
            isWishlisted ? "text-burgundy" : "text-taupe/40 hover:text-burgundy"
          }`}
          aria-label={isWishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} strokeWidth={isWishlisted ? 2 : 1.5} />
        </button>

        {/* Primary Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="text-taupe px-2 py-1 text-[10px] tracking-wider bg-white/80 rounded-[2px] font-bold border border-graySoft">
              نفد المخزون
            </span>
          ) : (
            primaryBadge
          )}
        </div>

        {/* Image — Edge-to-edge feel with mix-blend for unified background */}
        <Link to={`/product/${product.slug}`} className="relative w-full h-full flex items-center justify-center p-4">
          <img
            src={primaryImage}
            alt={product.name_ar}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-contain mix-blend-multiply drop-shadow-md group-hover:drop-shadow-xl group-hover:scale-105 transition-all duration-700 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </Link>
      </div>

      {/* Product Info (Hierarchical) */}
      <div className="px-1 flex flex-col flex-grow">
        
        {/* Title */}
        <Link to={`/product/${product.slug}`} className="mb-3 block text-center">
          <h3 className="text-[15px] font-bold text-[#2A1A17] font-alexandria group-hover:text-gold-dark transition-colors truncate">
            {product.name_ar}
          </h3>
          <p className="text-[9px] text-taupe uppercase font-serif tracking-[0.25em] mt-1.5 truncate">
            {product.name_en}
          </p>
        </Link>

        {/* Price & CTA Container */}
        <div className="mt-auto flex flex-col gap-3">
          
          <div className="flex items-center justify-center gap-2">
            <span className={`text-sm font-bold ${isOutOfStock ? "text-taupe" : "text-[#2A1A17]"}`}>
              {formatPrice(product.sale_price ?? product.price)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-taupe/60 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`relative flex items-center justify-center gap-2 px-4 py-2.5 transition-all duration-300 text-[11px] font-bold rounded-[2px] w-full ${
              isOutOfStock
                ? "bg-transparent text-taupe cursor-not-allowed border border-graySoft/50"
                : "bg-transparent text-[#2A1A17] border border-gold/30 hover:border-gold hover:bg-[#FAF8F5] active:scale-[0.98]"
            }`}
          >
            {/* Scent Dispersal Effect on Card */}
            {isAdding && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute inset-0 bg-gold/30 rounded-[2px] blur-[6px] pointer-events-none z-0"
              />
            )}
            <span className="relative z-10">{isAdding ? "جاري الإضافة..." : (isOutOfStock ? "نفد المخزون" : "إضافة للسلة")}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
