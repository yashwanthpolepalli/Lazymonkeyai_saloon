"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Scissors,
  CreditCard,
  Package,
  BarChart3,
  Megaphone,
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Sparkles,
  Heart,
  Moon,
  Sun,
  ArrowRight,
  Check,
} from "lucide-react";
import { useSalon } from "@/context/SalonContext";
import { Role } from "@/types";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { setActiveRole, setActiveSubTab, addToast } = useSalon();
  const [selectedRole, setSelectedRole] = useState<Role>("customer");
  const [emailOrPhone, setEmailOrPhone] = useState("sarah.jenkins@gmail.com");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Floating rose petals data
  const petals = [
    { id: 1, left: "15%", top: "-10%", size: "w-4 h-6", delay: "0s", duration: "12s" },
    { id: 2, left: "35%", top: "-10%", size: "w-5 h-7", delay: "3s", duration: "14s" },
    { id: 3, left: "55%", top: "-10%", size: "w-3 h-5", delay: "1.5s", duration: "11s" },
    { id: 4, left: "75%", top: "-10%", size: "w-6 h-8", delay: "5s", duration: "16s" },
    { id: 5, left: "85%", top: "-10%", size: "w-4 h-6", delay: "7s", duration: "13s" },
    { id: 6, left: "25%", top: "-10%", size: "w-5 h-6", delay: "9s", duration: "15s" },
    { id: 7, left: "65%", top: "-10%", size: "w-4 h-5", delay: "4s", duration: "12s" },
    { id: 8, left: "45%", top: "-10%", size: "w-6 h-7", delay: "8s", duration: "17s" },
  ];

  const roleOptions: Array<{
    id: Role;
    label: string;
    sublabel: string;
    avatarUrl?: string;
    isCrown?: boolean;
    defaultEmail: string;
  }> = [
    {
      id: "customer",
      label: "Customer",
      sublabel: "Book & Manage",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
      defaultEmail: "sarah.jenkins@gmail.com",
    },
    {
      id: "owner",
      label: "Owner",
      sublabel: "Manage Saloon",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
      defaultEmail: "owner@lazymonkey.ai",
    },
    {
      id: "staff",
      label: "Staff",
      sublabel: "Your Schedule",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80",
      defaultEmail: "aria.stylist@lazymonkey.ai",
    },
    {
      id: "admin",
      label: "Super Admin",
      sublabel: "Platform Control",
      isCrown: true,
      defaultEmail: "superadmin@businessos.ai",
    },
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    const found = roleOptions.find((r) => r.id === role);
    if (found) {
      setEmailOrPhone(found.defaultEmail);
      setPassword("••••••••••••");
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setActiveRole(selectedRole);

      // Set initial subtab
      if (selectedRole === "customer") setActiveSubTab("memberships");
      else if (selectedRole === "owner") setActiveSubTab("dashboard");
      else if (selectedRole === "staff") setActiveSubTab("dashboard");
      else if (selectedRole === "admin") setActiveSubTab("franchises");

      addToast(
        "success",
        `Welcome to Lazymonkeyai Saloon`,
        `Successfully logged in as ${selectedRole.toUpperCase()}`
      );

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 600);
  };

  const featureBadges = [
    {
      icon: Calendar,
      label: "Bookings",
      bgGradient: "from-[#F43F5E] to-[#E11D48]",
      shadowColor: "shadow-rose-500/30",
    },
    {
      icon: Users,
      label: "Customers",
      bgGradient: "from-[#0284C7] to-[#0369A1]",
      shadowColor: "shadow-sky-500/30",
    },
    {
      icon: Scissors,
      label: "Staff",
      bgGradient: "from-[#EC4899] to-[#BE185D]",
      shadowColor: "shadow-pink-500/30",
    },
    {
      icon: CreditCard,
      label: "Payments",
      bgGradient: "from-[#0D9488] to-[#047857]",
      shadowColor: "shadow-teal-500/30",
    },
    {
      icon: Package,
      label: "Inventory",
      bgGradient: "from-[#EA580C] to-[#C2410C]",
      shadowColor: "shadow-orange-500/30",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      bgGradient: "from-[#7C3AED] to-[#5B21B6]",
      shadowColor: "shadow-purple-500/30",
    },
    {
      icon: Megaphone,
      label: "Marketing",
      bgGradient: "from-[#E11D48] to-[#9F1239]",
      shadowColor: "shadow-rose-600/30",
    },
    {
      icon: TrendingUp,
      label: "Growth",
      bgGradient: "from-[#D97706] to-[#B45309]",
      shadowColor: "shadow-amber-500/30",
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#120B0D] text-white flex flex-col justify-between overflow-x-hidden font-sans select-none">
      {/* Background High Resolution Salon Canvas */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Main Luxury Salon Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=85&w=2400')`,
            filter: "brightness(0.55) contrast(1.15)",
          }}
        />

        {/* Ambient Warm Golden Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120B0D] via-transparent to-black/60" />

        {/* Arched Mirror LED Halo Glow Effect */}
        <div className="absolute left-[12%] top-[18%] w-[320px] h-[520px] rounded-t-[160px] rounded-b-3xl border-4 border-amber-300/40 shadow-[0_0_80px_rgba(251,191,36,0.35)] pointer-events-none opacity-60 hidden md:block" />

        {/* Glowing Neon Sign: GOOD HAIR GOOD MOOD */}
        <div className="absolute left-[45%] top-[12%] text-center hidden xl:block pointer-events-none">
          <div className="font-sans font-bold text-3xl tracking-wider text-amber-200 drop-shadow-[0_0_20px_rgba(252,211,77,0.9)] opacity-90 animate-pulse">
            GOOD HAIR
          </div>
          <div className="italic font-normal text-3xl text-amber-200 drop-shadow-[0_0_25px_rgba(252,211,77,0.9)] opacity-90">
            GOOD MOOD
          </div>
          <div className="text-pink-300 text-xl drop-shadow-[0_0_15px_rgba(244,114,182,0.9)] mt-1">
            ♡
          </div>
        </div>

        {/* Animated Floating Falling Pink Rose Petals */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {petals.map((petal) => (
            <div
              key={petal.id}
              className={`absolute ${petal.size} bg-gradient-to-br from-pink-300/80 via-rose-400/80 to-pink-500/60 rounded-full shadow-lg shadow-pink-500/20 backdrop-blur-[1px]`}
              style={{
                left: petal.left,
                top: petal.top,
                animation: `floatRosePetal ${petal.duration} ease-in-out infinite`,
                animationDelay: petal.delay,
                transform: "rotate(45deg) skew(-15deg, -15deg)",
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes floatRosePetal {
          0% {
            transform: translateY(-50px) translateX(0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          50% {
            transform: translateY(45vh) translateX(40px) rotate(180deg) scale(1.05);
            opacity: 0.9;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(105vh) translateX(-30px) rotate(360deg) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes floatingBadge {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }

        .animate-floating-badge {
          animation: floatingBadge 4.5s ease-in-out infinite;
        }
      `}</style>

      {/* Main Container */}
      <div className="relative z-10 max-w-[1720px] w-full mx-auto px-6 sm:px-12 py-5 flex-1 flex flex-col justify-between">
        {/* Top Navbar */}
        <header className="w-full flex items-center justify-between pb-4">
          {/* Logo with Mascot */}
          <div className="flex items-center gap-3.5 cursor-pointer">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-300/40 backdrop-blur-md shadow-lg shadow-amber-500/10">
              <Crown className="w-4 h-4 text-amber-300 absolute -top-2.5 fill-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
              <div className="w-6 h-6 rounded-full border-2 border-amber-200 flex items-center justify-center relative">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-200 absolute left-1" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-200 absolute right-1" />
                <div className="w-2.5 h-1 border-b-2 border-amber-200 rounded-full absolute bottom-1" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
                Lazymonkeyai <span className="italic font-normal text-amber-200/90">Saloon</span>
              </h1>
              <span className="text-[9px] uppercase tracking-[0.25em] text-amber-200/70 font-semibold">
                Beauty &bull; Care &bull; Confidence
              </span>
            </div>
          </div>

          {/* Top Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md text-xs text-white/90 transition-all cursor-pointer shadow-md"
            >
              <Sun className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <Moon className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setLanguage(language === "EN" ? "FR" : "EN")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md text-xs text-white/90 transition-all cursor-pointer shadow-md"
            >
              <span>{language}</span>
              <span className="text-[9px] text-white/60">&#9662;</span>
            </button>
          </div>
        </header>

        {/* Center 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center my-auto py-4">
          {/* Left Column: Hero Text & 8 Feature Buttons */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-7 pr-0 lg:pr-4">
            <div className="space-y-3.5">
              <h2 className="text-4xl sm:text-6xl xl:text-[76px] font-normal leading-[1.06] tracking-tight text-white drop-shadow-xl">
                Beauty <br />
                Business <br />
                <span className="italic font-normal bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h2>

              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
                Manage. Grow. Glow.
              </p>

              <p className="text-sm sm:text-base text-slate-300/85 max-w-md font-light leading-relaxed">
                All-in-one salon management for a more beautiful tomorrow.
              </p>
            </div>

            {/* 8 Feature Badges Grid (2 rows x 4 columns) */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-lg pt-1">
              {featureBadges.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${item.bgGradient} flex items-center justify-center shadow-lg ${item.shadowColor} group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300 border border-white/25 backdrop-blur-md`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="text-[11px] sm:text-xs text-slate-300 mt-2 font-medium tracking-tight group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Metrics Glass Bar */}
            <div className="inline-flex items-center gap-6 sm:gap-9 px-6 sm:px-8 py-3.5 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-xl max-w-fit shadow-2xl">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  10K+
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Happy Customers
                </div>
              </div>
              <div className="h-7 w-[1px] bg-white/15" />
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  500+
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Salons
                </div>
              </div>
              <div className="h-7 w-[1px] bg-white/15" />
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-1">
                  4.8 <span className="text-amber-400 text-lg">★</span>
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  User Rating
                </div>
              </div>
            </div>

            {/* Cursive Golden Script Quote */}
            <div className="pt-1">
              <p className="italic text-2xl sm:text-3xl text-amber-200/90 font-light tracking-wide drop-shadow-md">
                &ldquo;More Than a Saloon, A Beautiful Journey&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: Floating Luxury White Login Dialog Card */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end relative">
            {/* Soft Backlight Radial Ambient */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/25 via-purple-500/20 to-amber-500/20 rounded-[42px] blur-3xl opacity-75 pointer-events-none" />

            <div className="relative w-full max-w-[490px] bg-white text-slate-900 rounded-[34px] p-7 sm:p-9 shadow-2xl border border-white/90 backdrop-blur-2xl">
              {/* Card Header Mascot Logo */}
              <div className="flex flex-col items-center text-center space-y-1.5 pb-5">
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 mb-1 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-600 absolute -top-2 fill-amber-500" />
                  <div className="w-6 h-6 rounded-full border-2 border-amber-800 flex items-center justify-center relative">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-800 absolute left-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-800 absolute right-1" />
                    <div className="w-2.5 h-1 border-b-2 border-amber-800 rounded-full absolute bottom-1" />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold tracking-tight text-slate-900">
                    Lazymonkeyai <span className="italic font-normal text-amber-700">Saloon</span>
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.2em] text-slate-400 font-semibold">
                    Beauty &bull; Care &bull; Confidence
                  </span>
                </div>

                <h3 className="text-2xl sm:text-[28px] font-bold text-slate-900 flex items-center justify-center gap-1.5 pt-1.5">
                  Welcome Back <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 inline" />
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Sign in to continue to your account
                </p>
              </div>

              {/* 4 Role Selector Cards */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {roleOptions.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 text-center cursor-pointer ${
                        isSelected
                          ? "bg-pink-50/90 border-2 border-pink-400 shadow-md shadow-pink-500/15"
                          : "bg-slate-50/90 border border-slate-200/80 hover:bg-slate-100/90"
                      }`}
                    >
                      {role.isCrown ? (
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center mb-1.5 shadow-sm">
                          <Crown className="w-5 h-5 text-amber-600 fill-amber-500" />
                        </div>
                      ) : (
                        <img
                          src={role.avatarUrl}
                          alt={role.label}
                          className="w-9 h-9 rounded-full object-cover mb-1.5 border-2 border-white shadow-sm"
                        />
                      )}
                      <span
                        className={`text-xs font-bold leading-tight ${
                          isSelected ? "text-pink-900" : "text-slate-800"
                        }`}
                      >
                        {role.label}
                      </span>
                      <span className="text-[9px] text-slate-400 tracking-tight leading-tight mt-0.5">
                        {role.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Login Form */}
              <form onSubmit={handleSignIn} className="space-y-3.5">
                {/* Email / Mobile Field */}
                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Enter your email or mobile number"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-pink-600 focus:ring-pink-500 accent-pink-600 cursor-pointer"
                    />
                    <span className="text-[11px] font-medium">Remember me</span>
                  </label>

                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      addToast("info", "Password Recovery", "Instructions have been sent to your email.");
                    }}
                    className="text-[11px] text-slate-500 hover:text-pink-600 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Sign In CTA (Pink to Navy Gradient Button) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E03874] via-[#7B2CBF] to-[#26194A] text-white text-sm font-semibold tracking-wide shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Login Divider */}
              <div className="relative flex items-center justify-center my-4.5">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  or continue with
                </span>
              </div>

              {/* Social Buttons: Google, Apple, Facebook */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => addToast("info", "Google Sign-in", "Connecting to Google...")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => addToast("info", "Apple Sign-in", "Connecting to Apple ID...")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.8 1.09-1.91.97-3.02-.95.04-2.1.63-2.78 1.43-.6.69-1.12 1.82-.98 2.91 1.06.08 2.14-.52 2.79-1.32z" />
                  </svg>
                  <span>Apple</span>
                </button>

                <button
                  type="button"
                  onClick={() => addToast("info", "Facebook Sign-in", "Connecting to Facebook...")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              {/* Bottom Card Footer Links */}
              <div className="text-center pt-4 space-y-1 border-t border-slate-100 mt-4.5">
                <p className="text-[11px] text-slate-600">
                  New to Lazymonkeyai Saloon?{" "}
                  <button
                    type="button"
                    onClick={() => addToast("info", "Create Account", "Opening registration form...")}
                    className="text-pink-600 font-bold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
                <p className="text-[10px] text-slate-400">
                  Let&apos;s make the world a more beautiful place &#9825;
                </p>
              </div>
            </div>

            {/* Bottom-right Corner Floating Accent Badge */}
            <div className="hidden xl:flex absolute -bottom-5 -right-5 items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-black/90 to-amber-900/90 border border-amber-300/40 text-amber-200 text-xs font-semibold backdrop-blur-md shadow-2xl animate-floating-badge">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Self Care Looks Good On You &#9825;</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Tags & Slider */}
        <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-3 sm:gap-6 text-slate-300/80 text-[11px] tracking-wide">
            <span className="hover:text-amber-200 transition-colors cursor-pointer">Hair</span>
            <span>&bull;</span>
            <span className="hover:text-amber-200 transition-colors cursor-pointer">Skin</span>
            <span>&bull;</span>
            <span className="hover:text-amber-200 transition-colors cursor-pointer">Nails</span>
            <span>&bull;</span>
            <span className="hover:text-amber-200 transition-colors cursor-pointer">Makeup</span>
            <span>&bull;</span>
            <span className="hover:text-amber-200 transition-colors cursor-pointer">Spa</span>
            <span>&bull;</span>
            <span className="hover:text-amber-200 transition-colors cursor-pointer">Wellness</span>
          </div>

          {/* Carousel dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1 rounded-full bg-amber-400" />
            <div className="w-1.5 h-1 rounded-full bg-white/30" />
            <div className="w-1.5 h-1 rounded-full bg-white/30" />
            <div className="w-1.5 h-1 rounded-full bg-white/30" />
            <div className="w-1.5 h-1 rounded-full bg-white/30" />
          </div>
        </footer>
      </div>
    </div>
  );
};
