import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Globe,
  ChevronDown,
  LayoutDashboard,
  Heart,
  User,
} from "lucide-react";
import Logo3D from "./Logo3D";
import { useStore } from "../lib/store";
import AnnouncementBar from "./AnnouncementBar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("OMR");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { cartCount, wishlist, user, isStaff } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle sticky header state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "الرئيسية", path: "/" },
    { label: "المتجر", path: "/shop" },
    { label: "التصنيفات", path: "/categories" },
    { label: "الأكثر مبيعاً", path: "/shop?best=1" },
    { label: "العروض", path: "/shop?sale=1" },
    { label: "من نحن", path: "/about" },
    { label: "تواصل معنا", path: "/contact" },
  ];

  return (
    <>
      <div className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-cream/95 backdrop-blur-md shadow-card" : "bg-cream"}`}>
        {/* Top Announcement Bar - hidden when scrolled for compactness */}
        <div className={`transition-all duration-300 overflow-hidden ${isScrolled ? "h-0 opacity-0" : "h-auto opacity-100"}`}>
          <AnnouncementBar />
        </div>

        {/* ─── MAIN HEADER (Desktop & Mobile) ─── */}
        <header className={`border-b border-graySoft/50 transition-all duration-300 ${isScrolled ? "py-2" : "py-4"} px-4 sm:px-6 lg:px-8`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* RIGHT: Menu (Mobile) + Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-3 -mr-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-taupe hover:text-burgundy transition-colors"
                aria-label="القائمة"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <Link to="/" className="flex items-center transform transition-transform duration-300 hover:opacity-90">
                <Logo3D size={isScrolled ? "sm" : "md"} />
              </Link>
            </div>

            {/* CENTER: Minimal & Elegant Search Bar (Desktop Only) */}
            <div className="hidden lg:block flex-1 max-w-lg mx-8 transition-all duration-300">
              <form onSubmit={handleSearchSubmit} className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن عطرك..."
                  className="w-full pl-10 pr-5 py-2.5 rounded-xl border border-[#2A1A17]/10 bg-[#FAF8F5] text-sm text-[#2A1A17] placeholder:text-taupe/50 focus:outline-none focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe hover:text-gold-dark transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* LEFT: Secondary Actions & Cart */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              
              {/* Desktop Only: Secondary Tools */}
              <div className="hidden lg:flex items-center gap-1 mr-2 pr-4 border-r border-graySoft">
                {/* Admin Dashboard Link */}
                <Link
                  to="/admin"
                  className="p-2 text-taupe hover:text-burgundy transition-colors"
                  title="لوحة التحكم"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>

                {/* Currency Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCurrencyOpen(!currencyOpen)}
                    className="p-2 flex items-center gap-1 text-taupe hover:text-burgundy transition-colors text-[11px] font-bold"
                  >
                    <span>{currency}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {currencyOpen && (
                    <div className="absolute left-0 mt-2 w-20 bg-cream-pure border border-graySoft rounded-md shadow-luxury py-1 z-50 text-xs overflow-hidden">
                      {["SAR", "OMR", "AED", "KWD"].map((cur) => (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => {
                            setCurrency(cur);
                            setCurrencyOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 hover:bg-beige transition-colors font-medium text-darkText"
                        >
                          {cur}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Language Toggle */}
                <button
                  type="button"
                  className="p-2 flex items-center gap-1 text-taupe hover:text-burgundy transition-colors text-[11px] font-bold"
                >
                  <span>EN</span>
                  <Globe className="w-3.5 h-3.5" />
                </button>

                {/* Wishlist Link */}
                <Link
                  to="/wishlist"
                  className="relative p-2 text-taupe hover:text-burgundy transition-colors"
                  title="المفضلة"
                >
                  <Heart className="w-4 h-4" />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full ring-2 ring-cream"></span>
                  )}
                </Link>

                {/* Account Link */}
                <Link
                  to={user ? "/account" : "/auth"}
                  className="p-2 text-taupe hover:text-burgundy transition-colors"
                  title={user ? "حسابي" : "تسجيل الدخول"}
                >
                  <User className="w-4 h-4" />
                </Link>
              </div>

              {/* Shopping Bag Button (Always visible & distinct) */}
              <Link
                to="/cart"
                className="relative p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-darkText hover:text-burgundy transition-colors group"
                title="سلة التسوق"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-burgundy transition-transform duration-300 group-hover:scale-110" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-gold text-burgundy-dark font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar Row (Minimal & Clean) */}
          <div className={`mt-3 lg:hidden overflow-hidden transition-all duration-300 ${isScrolled ? "h-0 opacity-0 mt-0" : "h-10 opacity-100"}`}>
            <form onSubmit={handleSearchSubmit} className="relative h-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن عطرك..."
                className="w-full h-full pl-10 pr-5 rounded-xl border border-[#2A1A17]/10 bg-[#FAF8F5] text-xs focus:outline-none focus:bg-[#FFFDF8] focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all placeholder:text-taupe/50 text-[#2A1A17] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
              <Search className="w-4 h-4 text-taupe absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        </header>

        {/* ─── DESKTOP NAVIGATION BAR ─── */}
        <div className={`hidden lg:block bg-cream border-b border-graySoft/30 overflow-hidden transition-all duration-300 ${isScrolled ? "h-0 opacity-0" : "h-auto opacity-100"}`}>
          <nav className="max-w-7xl mx-auto py-2.5 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || 
                  (link.path !== "/" && location.pathname.startsWith(link.path.split("?")[0]));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm transition-all duration-300 relative py-1 ${
                      isActive
                        ? "text-burgundy font-bold"
                        : "text-taupe hover:text-burgundy font-medium"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-gold rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className={`transition-all duration-300 ${isScrolled ? "h-[70px] lg:h-[80px]" : "h-[140px] lg:h-[160px]"}`} />

      {/* ─── MOBILE SLIDE-OUT MENU DRAWER ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="fixed inset-0 bg-darkText/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-cream shadow-luxury flex flex-col border-l border-graySoft transform transition-transform duration-300">
            
            {/* Drawer Header */}
            <div className="p-5 pt-safe flex items-center justify-between border-b border-graySoft/60 bg-cream">
              <Logo3D size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-taupe hover:text-burgundy transition-colors rounded-full hover:bg-beige"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-safe">
              {/* Primary Navigation Links */}
              <div className="py-2 px-5 flex flex-col">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path || 
                    (link.path !== "/" && location.pathname.startsWith(link.path.split("?")[0]));
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-base py-4 border-b border-graySoft/40 flex items-center justify-between transition-colors ${
                        isActive ? "text-burgundy font-bold" : "text-darkText font-medium hover:text-burgundy"
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
                    </Link>
                  );
                })}
              </div>

              {/* Secondary Controls Box */}
              <div className="px-5 mt-6">
                <h3 className="text-[10px] font-bold text-taupe uppercase tracking-wider mb-3">حسابي وإعدادات</h3>
                
                <div className="flex flex-col bg-cream-pure rounded-md border border-graySoft/60 overflow-hidden shadow-sm">
                  
                  <Link to={user ? "/account" : "/auth"} className="flex items-center gap-3 p-4 border-b border-graySoft/40 text-sm font-medium text-darkText hover:bg-beige transition-colors">
                    <User className="w-4 h-4 text-taupe" />
                    <span>{user ? "لوحة التحكم لحسابي" : "تسجيل الدخول / إنشاء حساب"}</span>
                  </Link>
                  
                  <Link to="/wishlist" className="flex items-center gap-3 p-4 border-b border-graySoft/40 text-sm font-medium text-darkText hover:bg-beige transition-colors">
                    <Heart className="w-4 h-4 text-taupe" />
                    <span className="flex-1">المفضلة</span>
                    {wishlist.length > 0 && (
                      <span className="bg-gold text-burgundy-dark text-[10px] font-bold px-2 py-0.5 rounded-full">{wishlist.length}</span>
                    )}
                  </Link>
                  
                  <Link to="/admin" className="flex items-center gap-3 p-4 border-b border-graySoft/40 text-sm font-medium text-burgundy hover:bg-beige transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-gold" />
                    <span>إدارة المتجر</span>
                  </Link>
                  
                  {/* Language Settings */}
                  <div className="flex items-center justify-between p-4 border-b border-graySoft/40">
                    <div className="flex items-center gap-2 text-darkText">
                      <Globe className="w-4 h-4 text-taupe" />
                      <span className="text-sm font-medium">اللغة</span>
                    </div>
                    <span className="text-xs font-bold text-burgundy bg-gold/10 px-2.5 py-1 rounded-sm">العربية</span>
                  </div>
                  
                  {/* Currency Settings */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2 text-darkText">
                      <span className="text-sm font-medium pr-1">العملة</span>
                    </div>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="text-xs font-bold text-burgundy bg-gold/10 px-2.5 py-1 rounded-sm border-none focus:ring-0 outline-none cursor-pointer"
                    >
                      <option value="OMR">OMR</option>
                      <option value="SAR">SAR</option>
                      <option value="AED">AED</option>
                      <option value="KWD">KWD</option>
                    </select>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
