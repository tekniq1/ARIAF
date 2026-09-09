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
    primaryBadge = <span className="bg-[#FAF0DC] text-[#8C6721] px-2 py-0.5 rounded-sm text-[10px] font-bold border border-[#D9B978]/30">-{discountPercent}% خصم</span>;
  } else if (product.is_best_seller) {
    primaryBadge = <span className="bg-cream/90 text-burgundy px-2 py-0.5 rounded-sm text-[10px] font-bold border border-gold/30">الأكثر طلباً</span>;
  } else if (product.is_new) {
    primaryBadge = <span className="bg-cream/90 text-taupe px-2 py-0.5 rounded-sm text-[10px] font-bold border border-taupe/20">جديد</span>;
  }

  return (
    <motion.div
      whileHover={{ y: isOutOfStock ? 0 : -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group relative flex flex-col bg-white rounded-2xl border border-transparent hover:border-gold/20 hover:shadow-luxury transition-all duration-300 overflow-hidden ${
        isOutOfStock ? "opacity-80 grayscale-[20%]" : ""
      }`}
    >
      {/* Product Image Frame — warm neutral stage, supports bottles, jars, boxes alike */}
      <div className="relative aspect-[4/5] bg-gradient-to-b from-[#F5F0E8] to-[#EDE7D8] p-5 flex items-center justify-center overflow-hidden">
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 left-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isWishlisted
              ? "bg-cream text-burgundy shadow-sm"
              : "bg-cream/50 text-taupe hover:text-burgundy hover:bg-cream"
          }`}
          aria-label={isWishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Primary Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="bg-taupe/10 text-taupe px-2 py-0.5 rounded-sm text-[10px] font-bold border border-taupe/20">
              نفد المخزون
            </span>
          ) : (
            primaryBadge
          )}
        </div>

        {/* Image — object-cover for flat/box products, centered */}
        <Link to={`/product/${product.slug}`} className="relative w-full h-full flex items-center justify-center">
          <img
            src={primaryImage}
            alt={product.name_ar}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-contain filter drop-shadow-md group-hover:drop-shadow-xl group-hover:scale-[1.03] transition-all duration-500 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Subtle floor shadow */}
          <div className={`absolute bottom-[4%] w-[55%] h-3 bg-black/10 blur-[12px] rounded-[100%] pointer-events-none transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} />
        </Link>
      </div>

      {/* Product Info (Hierarchical) */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        {/* Title */}
        <Link to={`/product/${product.slug}`} className="mb-1 block">
          <h3 className="text-base font-bold text-burgundy group-hover:text-gold-dark transition-colors truncate">
            {product.name_ar}
          </h3>
          <p className="text-[10px] text-taupe uppercase font-serif tracking-widest mt-0.5 truncate">
            {product.name_en}
          </p>
        </Link>

        {/* Rating (Secondary) */}
        <div className="flex items-center gap-1 text-[10px] text-taupe mb-3">
          <Star className="w-3 h-3 fill-gold text-gold" />
          <span>{product.average_rating || 5.0}</span>
          <span className="opacity-60">({product.total_reviews || 0})</span>
        </div>

        <div className="mt-auto pt-1 flex items-center justify-between gap-1 sm:gap-2">
          {/* Price */}
          <div className="flex flex-col min-w-0">
            {hasDiscount && (
              <span className="text-[10px] text-taupe line-through -mb-0.5 truncate">
                {formatPrice(product.price)}
              </span>
            )}
            <span className={`text-xs sm:text-sm font-bold truncate ${isOutOfStock ? "text-taupe" : "text-burgundy"}`}>
              {formatPrice(product.sale_price ?? product.price)}
            </span>
          </div>

          {/* Compact CTA */}
          <button
            disabled={isOutOfStock}
            onClick={() => !isOutOfStock && addToCart(product)}
            className={`shrink-0 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm transition-all duration-300 text-[10px] sm:text-xs font-semibold ${
              isOutOfStock
                ? "bg-beige text-taupe cursor-not-allowed"
                : "bg-cream text-burgundy border border-gold/20 hover:bg-burgundy hover:text-cream hover:border-burgundy"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden min-[400px]:inline">إضافة</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
