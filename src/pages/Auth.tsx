import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, User, Phone, ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useStore } from "../lib/store";
import Logo3D from "../components/Logo3D";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const { showToast, refreshProfile } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/account";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      if (data.user) {
        showToast("تم تسجيل الدخول بنجاح، مرحباً بك في أرياف!");
        await refreshProfile();
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      showToast(err.message || "فشل تسجيل الدخول، تأكد من صحة البيانات", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast("يرجى إدخال الاسم ورقم الجوال", "error");
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) throw error;
      if (data.user) {
        showToast("تم إنشاء حسابك بنجاح! مرحباً بك في عالم أرياف.");
        await refreshProfile();
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء إنشاء الحساب", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?reset=1`,
      });
      if (error) throw error;
      showToast("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.");
      setMode("login");
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء إرسال الرابط", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 flex items-center justify-center bg-beige/30">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gold/30 shadow-luxury relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-burgundy via-gold to-burgundy" />

        {/* Logo */}
        <div className="text-center mb-8">
          <Logo3D size="sm" />
          <p className="text-xs text-darkText/60 mt-3 font-serif">
            بوابتك الحصرية إلى عالم العطور الملكية
          </p>
        </div>

        {/* Mode Tabs */}
        {mode !== "forgot" && (
          <div className="flex border-b border-graySoft mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
                mode === "login" ? "text-burgundy" : "text-darkText/50 hover:text-burgundy"
              }`}
            >
              تسجيل الدخول
              {mode === "login" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gold" />
              )}
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
                mode === "register" ? "text-burgundy" : "text-darkText/50 hover:text-burgundy"
              }`}
            >
              إنشاء حساب جديد
              {mode === "register" && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gold" />
              )}
            </button>
          </div>
        )}

        {/* Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-darkText">كلمة المرور</label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-[11px] text-gold-dark hover:underline font-semibold"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-all duration-300 transform active:scale-95 disabled:opacity-50 mt-2"
            >
              {busy ? "جاري الدخول..." : "دخول إلى حسابي"}
            </button>
          </form>
        )}

        {/* Registration Form */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="محمد السبيعي"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none"
                />
                <User className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">رقم الجوال</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0501234567"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6 أحرف على الأقل"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-darkText/40 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-light text-cream font-bold text-xs shadow-gold transition-all duration-300 transform active:scale-95 disabled:opacity-50 mt-2"
            >
              {busy ? "جاري الإنشاء..." : "إنشاء الحساب الفاخر"}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <h3 className="text-base font-bold text-burgundy mb-2">استعادة كلمة المرور</h3>
            <p className="text-xs text-darkText/70 mb-4">
              أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>

            <div>
              <label className="block text-xs font-bold text-darkText mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gold/30 bg-cream text-xs focus:ring-1 focus:ring-gold outline-none text-left"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-burgundy text-cream font-bold text-xs shadow-gold disabled:opacity-50"
            >
              {busy ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
            </button>

            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full text-center text-xs text-darkText/60 hover:text-burgundy pt-2"
            >
              العودة إلى تسجيل الدخول
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
