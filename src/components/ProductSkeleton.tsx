import React from "react";

export default function ProductSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-transparent overflow-hidden h-full">
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] bg-[#FAF8F5] p-6 flex items-center justify-center overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        {/* Title */}
        <div className="mb-1 block">
          <div className="h-4 bg-[#FAF8F5] rounded-sm w-3/4 mb-2 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
          </div>
          <div className="h-2.5 bg-[#FAF8F5] rounded-sm w-1/2 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-[10px] text-taupe mb-3 mt-1">
          <div className="h-3 w-16 bg-[#FAF8F5] rounded-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
          </div>
        </div>

        <div className="mt-auto pt-1 flex items-center justify-between gap-1 sm:gap-2">
          {/* Price */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="h-4 bg-[#FAF8F5] rounded-sm w-16 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
            </div>
          </div>

          {/* CTA Button Placeholder */}
          <div className="shrink-0 w-16 h-7 bg-[#FAF8F5] rounded-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
