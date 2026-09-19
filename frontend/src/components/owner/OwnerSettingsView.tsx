"use client";

import React, { useState } from "react";
import { useSalon } from "@/context/SalonContext";
import {
  Settings,
  Sliders,
  Building2,
  User,
  ShieldCheck,
  Lock,
  Upload,
  Camera,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Smartphone,
  Mail,
  Key,
  Palette,
  Receipt,
  Clock,
  MessageSquare,
  Globe,
  MapPin,
  Phone,
  DollarSign,
  Percent,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Calculator,
  FileText,
  Layers,
  Tag,
  FileSpreadsheet,
  Download,
  Database,
  HardDriveDownload,
} from "lucide-react";
import { Branch } from "@/types";
import { DataImportModal, ImportDataType } from "@/components/common/DataImportModal";
import {
  downloadCsvFile,
  SAMPLE_SERVICES_CSV,
  SAMPLE_CUSTOMERS_CSV,
  SAMPLE_INVENTORY_CSV,
} from "@/lib/csvHelper";

export function OwnerSettingsView() {
  const {
    ownerProfile,
    updateOwnerProfile,
    branches,
    addBranch,
    deleteBranch,
    selectedBranchId,
    setSelectedBranchId,
    mfaSettings,
    toggleMfaMaster,
    togglePageMfa,
    customizationSettings,
    updateCustomization,
    gstSettings,
    updateGstSettings,
    services,
    customers,
    inventory,
    addToast,
  } = useSalon();

  // Settings Sub-tab state
  const [activeTab, setActiveTab] = useState<
    "profile" | "branches" | "customizations" | "mfa" | "discounts" | "data-hub"
  >("profile");

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importModalType, setImportModalType] = useState<ImportDataType>("services");

  const handleOpenImport = (type: ImportDataType) => {
    setImportModalType(type);
    setImportModalOpen(true);
  };

  // ==========================================
  // 1. OWNER PROFILE STATE
  // ==========================================
  const [profName, setProfName] = useState(ownerProfile.name);
  const [profTitle, setProfTitle] = useState(ownerProfile.title);
  const [profEmail, setProfEmail] = useState(ownerProfile.email);
  const [profPhone, setProfPhone] = useState(ownerProfile.phone);
  const [profBio, setProfBio] = useState(ownerProfile.bio);
  const [profAvatar, setProfAvatar] = useState(ownerProfile.avatarUrl);

  const PRESET_AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
  ];

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setProfAvatar(reader.result);
          addToast("success", "Icon Preview Loaded", "Click Save Profile to persist changes.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateOwnerProfile({
      name: profName.trim(),
      title: profTitle.trim(),
      email: profEmail.trim(),
      phone: profPhone.trim(),
      bio: profBio.trim(),
      avatarUrl: profAvatar,
    });
  };

  // ==========================================
  // 2. BRANCH CREATIONS MODAL & FORM STATE
  // ==========================================
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");
  const [branchFilterType, setBranchFilterType] = useState("all");

  // 1. Basic Information
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState(`LM-0${branches.length + 1}`);
  const [branchType, setBranchType] = useState<string>("Flagship Studio");
  const [branchManager, setBranchManager] = useState("Vikram Malhotra");
  const [branchStatus, setBranchStatus] = useState<string>("active");

  // 2. Contact Information
  const [branchPhone, setBranchPhone] = useState("+91 80 4122 8899");
  const [branchEmail, setBranchEmail] = useState("bengaluru.flagship@lazymonkeyai.luxury");
  const [branchWhatsapp, setBranchWhatsapp] = useState("+91 98200 99881");

  // 3. Location
  const [branchAddress, setBranchAddress] = useState("Level 2, 100 Feet Road, HAL 2nd Stage, Indiranagar");
  const [branchCity, setBranchCity] = useState("Bengaluru");
  const [branchState, setBranchState] = useState("Karnataka");
  const [branchCountry, setBranchCountry] = useState("India");
  const [branchPinCode, setBranchPinCode] = useState("560038");
  const [branchMapLocation, setBranchMapLocation] = useState("12.9716° N, 77.5946° E (Indiranagar 100ft)");

  // 5. Branding & Operational
  const [branchImage, setBranchImage] = useState(
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
  );
  const [branchLogo, setBranchLogo] = useState(
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80"
  );
  const [branchDescription, setBranchDescription] = useState(
    "Ultra-luxury 14-station flagship atelier featuring private VIP styling suites, organic hair spa lounge & complimentary champagne bar."
  );
  const [branchCurrency, setBranchCurrency] = useState("INR");
  const [branchTaxRate, setBranchTaxRate] = useState("18");
  const [branchChairs, setBranchChairs] = useState("12");
  const [branchHours, setBranchHours] = useState("09:00 AM - 09:30 PM");

  const PRESET_BRANCH_IMAGES = [
    {
      label: "Modern Marble Atelier",
      img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    },
    {
      label: "Haute Rodeo Suite",
      img: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      label: "Mayfair Private Lounge",
      img: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=80",
    },
    {
      label: "Botanical Spa Studio",
      img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const handleBranchImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setBranchImage(reader.result);
          addToast("success", "Branch Cover Loaded", "Image preview updated.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBranchLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setBranchLogo(reader.result);
          addToast("success", "Branch Logo Loaded", "Logo preview updated.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) {
      addToast("warning", "Branch Name Required", "Please enter a valid salon branch name.");
      return;
    }

    addBranch({
      name: branchName.trim(),
      code: branchCode.trim() || `LM-0${branches.length + 1}`,
      branchType: branchType,
      managerName: branchManager.trim() || "Unassigned",
      status: branchStatus,
      phone: branchPhone.trim(),
      email: branchEmail.trim(),
      whatsapp: branchWhatsapp.trim() || branchPhone.trim(),
      address: branchAddress.trim(),
      city: branchCity.trim(),
      state: branchState.trim(),
      country: branchCountry.trim(),
      pinCode: branchPinCode.trim(),
      mapLocation: branchMapLocation.trim(),
      image: branchImage,
      logo: branchLogo,
      description: branchDescription.trim(),
      currency: branchCurrency,
      taxRate: (parseFloat(branchTaxRate) || 18) / 100,
      chairsCount: parseInt(branchChairs, 10) || 10,
      openingHours: branchHours,
    });

    setBranchName("");
    setIsCreateBranchOpen(false);
  };

  // ==========================================
  // 3. SALON CUSTOMIZATIONS STATE
  // ==========================================
  const [customBrandName, setCustomBrandName] = useState(customizationSettings.salonName);
  const [customTagline, setCustomTagline] = useState(customizationSettings.tagline);
  const [customLogoUrl, setCustomLogoUrl] = useState(
    customizationSettings.logoUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80"
  );
  const [customMonogram, setCustomMonogram] = useState(customizationSettings.monogram || "LM");
  const [customAccent, setCustomAccent] = useState(customizationSettings.accentPreset);
  const [customCurrencySymbol, setCustomCurrencySymbol] = useState(customizationSettings.currencySymbol);
  const [customTaxRate, setCustomTaxRate] = useState(customizationSettings.taxRatePct.toString());
  const [customInvoiceHeader, setCustomInvoiceHeader] = useState(customizationSettings.invoiceHeader);
  const [customInvoiceFooter, setCustomInvoiceFooter] = useState(customizationSettings.invoiceFooter);
  const [customSlotDuration, setCustomSlotDuration] = useState(customizationSettings.slotDuration.toString());
  const [customBufferTime, setCustomBufferTime] = useState(customizationSettings.bufferTime.toString());
  const [customSmsBooking, setCustomSmsBooking] = useState(customizationSettings.smsBookingConfirm);
  const [customSmsReminder, setCustomSmsReminder] = useState(customizationSettings.smsReminder2h);
  const [customWhatsappReceipt, setCustomWhatsappReceipt] = useState(customizationSettings.whatsappReceipt);
  const [customOnlineBooking, setCustomOnlineBooking] = useState(customizationSettings.onlineBookingOpen);

  const PRESET_SALON_LOGOS = [
    {
      label: "Gold Leaf Emblem",
      url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80",
    },
    {
      label: "Haute Monogram",
      url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=200&q=80",
    },
    {
      label: "Minimalist Crown",
      url: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=200&q=80",
    },
    {
      label: "Diamond Silhouette",
      url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=200&q=80",
    },
  ];

  const handleSalonLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCustomLogoUrl(reader.result);
          addToast("success", "Salon Logo Preview Loaded", "Save customisations to update your salon branding.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCustomizations = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomization({
      salonName: customBrandName.trim(),
      tagline: customTagline.trim(),
      logoUrl: customLogoUrl,
      monogram: customMonogram.trim() || "LM",
      accentPreset: customAccent,
      currencySymbol: customCurrencySymbol.trim(),
      taxRatePct: parseFloat(customTaxRate) || 18,
      invoiceHeader: customInvoiceHeader.trim(),
      invoiceFooter: customInvoiceFooter.trim(),
      slotDuration: parseInt(customSlotDuration, 10) || 30,
      bufferTime: parseInt(customBufferTime, 10) || 10,
      smsBookingConfirm: customSmsBooking,
      smsReminder2h: customSmsReminder,
      whatsappReceipt: customWhatsappReceipt,
      onlineBookingOpen: customOnlineBooking,
    });
  };

  // ==========================================
  // 4. MFA SETUP SIMULATION
  // ==========================================
  const [mfaCodeInput, setMfaCodeInput] = useState("");
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);

  const handleVerifyMfaSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCodeInput.length === 6) {
      setIsVerifyingMfa(true);
      setTimeout(() => {
        setIsVerifyingMfa(false);
        toggleMfaMaster(true);
        addToast("success", "MFA Authentication Verified", "Google Authenticator is now successfully linked.");
        setMfaCodeInput("");
      }, 700);
    } else {
      addToast("warning", "Invalid Code", "Please enter a 6-digit TOTP code.");
    }
  };

  // ==========================================
  // 5. DISCOUNT & GST TAXES STATE
  // ==========================================
  const [isGstEnabled, setIsGstEnabled] = useState(gstSettings.isGstEnabled);
  const [isDiscountEnabled, setIsDiscountEnabled] = useState(gstSettings.isDiscountEnabled);
  const [isSgstEnabled, setIsSgstEnabled] = useState(gstSettings.isSgstEnabled ?? true);
  const [isCgstEnabled, setIsCgstEnabled] = useState(gstSettings.isCgstEnabled ?? true);
  const [isIgstEnabled, setIsIgstEnabled] = useState(gstSettings.isIgstEnabled ?? false);
  const [gstRatePct, setGstRatePct] = useState(gstSettings.gstRatePct);
  const [cgstRatePct, setCgstRatePct] = useState(gstSettings.cgstRatePct);
  const [sgstRatePct, setSgstRatePct] = useState(gstSettings.sgstRatePct);
  const [igstRatePct, setIgstRatePct] = useState(gstSettings.igstRatePct);
  const [gstin, setGstin] = useState(gstSettings.gstin);
  const [hsnSacCode, setHsnSacCode] = useState(gstSettings.hsnSacCode);
  const [taxPricingMode, setTaxPricingMode] = useState(gstSettings.taxPricingMode);
  const [maxCashierDiscountPct, setMaxCashierDiscountPct] = useState(gstSettings.maxCashierDiscountPct);
  const [applyDiscountBeforeTax, setApplyDiscountBeforeTax] = useState(gstSettings.applyDiscountBeforeTax);
  const [discountPresets, setDiscountPresets] = useState<number[]>(gstSettings.defaultDiscountPresets);
  const [newPresetInput, setNewPresetInput] = useState<string>("");
  const [membershipDiscounts, setMembershipDiscounts] = useState(gstSettings.membershipDiscounts);

  // Live Simulator State
  const [simServiceAmount, setSimServiceAmount] = useState<number>(5000);
  const [simDiscountPct, setSimDiscountPct] = useState<number>(10);

  const applyGstPreset = (rate: number) => {
    setGstRatePct(rate);
    setCgstRatePct(Number((rate / 2).toFixed(2)));
    setSgstRatePct(Number((rate / 2).toFixed(2)));
    setIgstRatePct(rate);
  };

  const handleTotalGstChange = (val: number) => {
    const clamped = Math.max(0, val);
    setGstRatePct(clamped);
    setCgstRatePct(Number((clamped / 2).toFixed(2)));
    setSgstRatePct(Number((clamped / 2).toFixed(2)));
    setIgstRatePct(clamped);
  };

  const handleCgstChange = (val: number) => {
    const clamped = Math.max(0, val);
    setCgstRatePct(clamped);
    const total = Number((clamped + sgstRatePct).toFixed(2));
    setGstRatePct(total);
    setIgstRatePct(total);
  };

  const handleSgstChange = (val: number) => {
    const clamped = Math.max(0, val);
    setSgstRatePct(clamped);
    const total = Number((cgstRatePct + clamped).toFixed(2));
    setGstRatePct(total);
    setIgstRatePct(total);
  };

  const handleAddPreset = () => {
    const val = parseInt(newPresetInput, 10);
    if (!isNaN(val) && val >= 0 && val <= 100 && !discountPresets.includes(val)) {
      setDiscountPresets([...discountPresets, val].sort((a, b) => a - b));
      setNewPresetInput("");
    }
  };

  const handleRemovePreset = (val: number) => {
    setDiscountPresets(discountPresets.filter((p) => p !== val));
  };

  const handleSaveGstAndDiscounts = (e: React.FormEvent) => {
    e.preventDefault();
    updateGstSettings({
      isGstEnabled,
      isDiscountEnabled,
      isSgstEnabled,
      isCgstEnabled,
      isIgstEnabled,
      gstRatePct,
      cgstRatePct,
      sgstRatePct,
      igstRatePct,
      gstin: gstin.trim(),
      hsnSacCode: hsnSacCode.trim(),
      taxPricingMode,
      maxCashierDiscountPct,
      applyDiscountBeforeTax,
      defaultDiscountPresets: discountPresets,
      membershipDiscounts,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Owner Control Center & System Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Salon Settings & Configurations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage owner profiles, franchise branch creations, luxury branding customizations, and page-level Multi-Factor Authentication.
          </p>
        </div>

        {/* Global Security Badge */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className={`p-2 rounded-lg ${mfaSettings.isMFAEnabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {mfaSettings.isMFAEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              {mfaSettings.isMFAEnabled ? "MFA Protected" : "MFA Disabled"}
            </div>
            <div className="text-[10px] text-slate-500">
              {mfaSettings.isMFAEnabled ? "2-Factor active for sensitive pages" : "Enable MFA to secure ledger & payroll"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Card (Sky Blue Active Tabs) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {/* Tab 1: Owner Profile */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Owner Profile & Avatar</span>
          </button>

          {/* Tab 2: Branch Creations */}
          <button
            onClick={() => setActiveTab("branches")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "branches"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Branch Creations & Network</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "branches" ? "bg-white/20 text-white" : "bg-sky-100 text-sky-800"
              }`}
            >
              {branches.length}
            </span>
          </button>

          {/* Tab 3: Customisations */}
          <button
            onClick={() => setActiveTab("customizations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "customizations"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Salon Customisations</span>
          </button>

          {/* Tab 4: MFA & Security */}
          <button
            onClick={() => setActiveTab("mfa")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "mfa"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MFA Activations & Page Security</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "mfa" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              2FA
            </span>
          </button>

          {/* Tab 5: Discounts & GST Taxes */}
          <button
            onClick={() => setActiveTab("discounts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "discounts"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Discount & GST Taxes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "discounts"
                  ? "bg-white/20 text-white"
                  : isGstEnabled
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {isGstEnabled ? `${gstRatePct}% GST` : "Tax Off"}
            </span>
          </button>

          {/* Tab 6: Data Import & Sample CSV Hub */}
          <button
            onClick={() => setActiveTab("data-hub")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "data-hub"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 font-bold"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Import / Export & Sample CSV</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "data-hub" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              }`}
            >
              CSV / XLS
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OWNER PROFILE & AVATAR UPLOAD TAB                                      */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Profile Preview Card & Avatar Upload */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <img
                  src={profAvatar}
                  alt={profName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-sky-200"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-1 right-1 p-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-md cursor-pointer transition-transform hover:scale-105"
                  title="Upload New Profile Picture"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{profName}</h2>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mt-0.5">
                {profTitle}
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Franchise Owner</span>
              </span>

              {/* Preset Avatar Selector */}
              <div className="w-full mt-6 pt-5 border-t border-slate-100 text-left">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Select Preset Luxury Avatars
                </label>
                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfAvatar(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        profAvatar === url
                          ? "border-sky-500 ring-2 ring-sky-300 scale-105"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Custom File Button */}
              <label
                htmlFor="avatar-upload-btn"
                className="mt-4 w-full py-2.5 px-4 rounded-xl border border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 text-sky-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-sky-600" />
                <span>Upload Profile Icon (PNG / JPG)</span>
                <input
                  id="avatar-upload-btn"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Right: Owner Profile Information Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Owner Identity & Credentials</h2>
                  <p className="text-xs text-slate-500">
                    Update personal profile, contact information, and business credentials.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Official Title / Designation
                    </label>
                    <input
                      type="text"
                      value={profTitle}
                      onChange={(e) => setProfTitle(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Direct Email Address
                    </label>
                    <input
                      type="email"
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Direct Mobile / WhatsApp Phone
                    </label>
                    <input
                      type="text"
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Owner Bio & Brand Mission
                  </label>
                  <textarea
                    rows={3}
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 transition-colors"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    Save Owner Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BRANCH CREATIONS & NETWORK TAB                                         */}
      {/* ========================================================================= */}
      {activeTab === "branches" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Create Branch Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Salon Branch Management & Franchise Network</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {branches.length} physical luxury salons operating with synchronized POS, staff rosters, and regional tax policies.
              </p>
            </div>

            <button
              onClick={() => setIsCreateBranchOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Salon Branch</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search branches by name, code, city, or manager..."
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                className="w-full px-4 py-2 text-xs text-slate-900 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={branchFilterType}
                onChange={(e) => setBranchFilterType(e.target.value)}
                className="px-3 py-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Branch Types</option>
                <option value="Flagship Studio">Flagship Studio</option>
                <option value="Luxury Suite">Luxury Suite</option>
                <option value="Express Bar">Express Bar</option>
                <option value="Franchise Partner">Franchise Partner</option>
                <option value="Resort Spa">Resort Spa</option>
              </select>
            </div>
          </div>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches
              .filter((b) => {
                if (branchFilterType !== "all" && b.branchType !== branchFilterType) return false;
                if (branchSearch.trim() !== "") {
                  const q = branchSearch.toLowerCase();
                  return (
                    b.name.toLowerCase().includes(q) ||
                    b.code.toLowerCase().includes(q) ||
                    b.city.toLowerCase().includes(q) ||
                    (b.managerName && b.managerName.toLowerCase().includes(q)) ||
                    (b.state && b.state.toLowerCase().includes(q))
                  );
                }
                return true;
              })
              .map((b) => {
                const isSelected = b.id === selectedBranchId;
                return (
                  <div
                    key={b.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                      isSelected ? "border-sky-500 ring-2 ring-sky-300" : "border-slate-200/90"
                    }`}
                  >
                    {/* Top Media Banner */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={b.image}
                        alt={b.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      {/* Code & Type */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                          {b.code}
                        </span>
                        {b.branchType && (
                          <span className="bg-sky-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {b.branchType}
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          b.status === "active"
                            ? "bg-emerald-500 text-white"
                            : b.status === "opening_soon"
                            ? "bg-amber-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}>
                          {b.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Bottom Banner Title */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-white drop-shadow-xs">{b.name}</h3>
                          <div className="text-[11px] text-slate-200 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                            <span>{b.city}, {b.state ? `${b.state}, ` : ""}{b.country}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-900 backdrop-blur-xs">
                          {b.currency}
                        </span>
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      {/* Manager & Description */}
                      <div className="space-y-2.5">
                        {b.managerName && (
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                            <User className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <div className="text-xs">
                              <span className="text-slate-400">Branch Manager: </span>
                              <span className="font-bold text-slate-800">{b.managerName}</span>
                            </div>
                          </div>
                        )}

                        {b.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {b.description}
                          </p>
                        )}

                        {/* Location & Contact Meta */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-slate-400 shrink-0">Address:</span>
                            <span className="font-medium text-right text-slate-800 truncate max-w-[220px]">
                              {b.address} {b.pinCode ? `• PIN ${b.pinCode}` : ""}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Phone:</span>
                            <span className="font-mono text-slate-700">{b.phone}</span>
                          </div>

                          {b.whatsapp && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">WhatsApp:</span>
                              <span className="font-mono text-emerald-700 font-semibold">{b.whatsapp}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Stations / Tax:</span>
                            <span className="font-semibold text-slate-800">
                              {b.chairsCount} Chairs • {Math.round(b.taxRate * 100)}% Tax
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedBranchId(b.id);
                            addToast("success", "Active Branch Switched", `Now operating ${b.name}`);
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-sky-500 text-white shadow-xs"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isSelected ? "Active Branch" : "Set As Active"}
                        </button>

                        <button
                          onClick={() => deleteBranch(b.id)}
                          disabled={branches.length <= 1}
                          title="Delete Branch"
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SALON CUSTOMISATIONS TAB                                               */}
      {/* ========================================================================= */}
      {activeTab === "customizations" && (
        <form onSubmit={handleSaveCustomizations} className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branding & Visual Identity (Salon Name & Logo Fields) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Palette className="w-4 h-4 text-sky-500" />
                <h3 className="font-bold text-sm text-slate-900">Salon Name, Brand Logo & Identity</h3>
              </div>

              {/* Live Brand Header Preview */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3">
                  {customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="Salon Brand Logo"
                      className="w-11 h-11 rounded-xl object-cover border border-amber-400/50 shadow-md"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-amber-500 flex items-center justify-center text-white font-bold text-base shadow-md">
                      {customMonogram || "LM"}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                      {customBrandName || "SALON BRAND NAME"}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono tracking-wider truncate max-w-[220px]">
                      {customTagline || "The Pinnacle of Haute Coiffure"}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-sky-200 uppercase tracking-widest">
                  Live Preview
                </span>
              </div>

              {/* Logo Upload & URL */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Salon Brand Logo / Emblem *</label>
                  <label
                    htmlFor="salon-logo-upload-btn"
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Logo</span>
                    <input
                      id="salon-logo-upload-btn"
                      type="file"
                      accept="image/*"
                      onChange={handleSalonLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs">
                    {customLogoUrl ? (
                      <img src={customLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="font-bold text-slate-400 text-xs">{customMonogram}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={customLogoUrl}
                      onChange={(e) => setCustomLogoUrl(e.target.value)}
                      placeholder="https://example.com/salon-logo.png"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-sky-500"
                    />
                    <div className="text-[10px] text-slate-400">Recommended 512x512 transparent PNG or SVG</div>
                  </div>
                </div>

                {/* Preset Logos */}
                <div className="pt-2 border-t border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">Select Preset Luxury Logos:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_SALON_LOGOS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomLogoUrl(preset.url)}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          customLogoUrl === preset.url
                            ? "border-sky-500 bg-sky-50 text-sky-700 font-bold ring-1 ring-sky-300"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-3.5 h-3.5 rounded-full object-cover" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Salon Name & Monogram */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Salon Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customBrandName}
                    onChange={(e) => setCustomBrandName(e.target.value)}
                    placeholder="e.g. LAZYMONKEY AI LUXURY SALON"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Monogram / Short
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={customMonogram}
                    onChange={(e) => setCustomMonogram(e.target.value.toUpperCase())}
                    placeholder="LM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Brand Tagline & Slogan
                </label>
                <input
                  type="text"
                  value={customTagline}
                  onChange={(e) => setCustomTagline(e.target.value)}
                  placeholder="e.g. The Pinnacle of Haute Coiffure & Bespoke Esthetics"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Primary Theme Accent Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "sky", label: "Sky Blue (Default)", color: "bg-sky-500 text-white" },
                    { id: "amber", label: "Royal Amber", color: "bg-amber-500 text-white" },
                    { id: "rose", label: "Rose Quartz", color: "bg-rose-500 text-white" },
                    { id: "emerald", label: "Emerald Spa", color: "bg-emerald-500 text-white" },
                    { id: "violet", label: "Midnight Violet", color: "bg-violet-600 text-white" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setCustomAccent(preset.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                        customAccent === preset.id
                          ? "border-sky-500 ring-2 ring-sky-300 bg-sky-50/50 text-slate-900"
                          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{preset.label}</span>
                      <span className={`w-3.5 h-3.5 rounded-full ${preset.color}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Online Booking Portal Status</div>
                  <div className="text-[11px] text-slate-400">Allow customers to book appointments online</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomOnlineBooking(!customOnlineBooking)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    customOnlineBooking ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      customOnlineBooking ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Invoicing, Billing & Tax Customizations */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Receipt className="w-4 h-4 text-sky-500" />
                <h3 className="font-bold text-sm text-slate-900">Invoicing, Taxes & Receipts</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={customCurrencySymbol}
                    onChange={(e) => setCustomCurrencySymbol(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Default Tax / GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={customTaxRate}
                    onChange={(e) => setCustomTaxRate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Receipt Header Notice
                </label>
                <input
                  type="text"
                  value={customInvoiceHeader}
                  onChange={(e) => setCustomInvoiceHeader(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Receipt Footer & Return Policy
                </label>
                <textarea
                  rows={2}
                  value={customInvoiceFooter}
                  onChange={(e) => setCustomInvoiceFooter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            {/* Appointment Booking Rules & Notifications */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Clock className="w-4 h-4 text-sky-500" />
                <h3 className="font-bold text-sm text-slate-900">Appointment Rules & Automated Client Notifications</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Default Service Slot Duration (Minutes)
                  </label>
                  <select
                    value={customSlotDuration}
                    onChange={(e) => setCustomSlotDuration(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes (Recommended)</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Stylist Buffer Time Between Slots (Minutes)
                  </label>
                  <select
                    value={customBufferTime}
                    onChange={(e) => setCustomBufferTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
                  >
                    <option value="0">0 Minutes (No buffer)</option>
                    <option value="5">5 Minutes</option>
                    <option value="10">10 Minutes (Recommended)</option>
                    <option value="15">15 Minutes</option>
                  </select>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">SMS Booking Confirmation</div>
                    <div className="text-[10px] text-slate-400">Instant SMS after booking</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={customSmsBooking}
                    onChange={(e) => setCustomSmsBooking(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">SMS Reminder 2h Prior</div>
                    <div className="text-[10px] text-slate-400">Reduces salon no-shows</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={customSmsReminder}
                    onChange={(e) => setCustomSmsReminder(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">WhatsApp Digital Receipt</div>
                    <div className="text-[10px] text-slate-400">PDF receipt via WhatsApp</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={customWhatsappReceipt}
                    onChange={(e) => setCustomWhatsappReceipt(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              Save All Customisations
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 4. MFA ACTIVATIONS & PAGE-LEVEL SECURITY TAB                              */}
      {/* ========================================================================= */}
      {activeTab === "mfa" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Master MFA Activation Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Master Two-Factor Authentication (MFA / 2FA)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Require multi-factor authorization codes to authenticate logins and approve critical salon transactions.
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <span className="text-xs font-bold text-slate-700">
                  {mfaSettings.isMFAEnabled ? "MFA ACTIVATED (ON)" : "MFA DISABLED (OFF)"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleMfaMaster(!mfaSettings.isMFAEnabled)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    mfaSettings.isMFAEnabled ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      mfaSettings.isMFAEnabled ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Authenticator App Setup QR View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center mb-3">
                  <QrCode className="w-24 h-24 text-slate-800" />
                </div>
                <div className="text-xs font-mono font-bold text-slate-700">LM-AUTH-8829-KEY</div>
                <div className="text-[10px] text-slate-400 mt-1">Scan with Google Authenticator or Authy</div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Link Authenticator App
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Scan the QR code with your mobile authenticator app. Enter the generated 6-digit code below to verify and link your device.
                  </p>
                </div>

                <form onSubmit={handleVerifyMfaSetup} className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code (e.g. 849201)"
                    value={mfaCodeInput}
                    onChange={(e) => setMfaCodeInput(e.target.value.replace(/\D/g, ""))}
                    className="w-64 px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono tracking-widest text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                  />

                  <button
                    type="submit"
                    disabled={isVerifyingMfa || mfaCodeInput.length !== 6}
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {isVerifyingMfa ? "Verifying..." : "Verify & Enable"}
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Backup Phone SMS</div>
                      <div className="text-[10px] font-mono text-slate-500">{mfaSettings.backupPhone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Backup Email OTP</div>
                      <div className="text-[10px] font-mono text-slate-500">{mfaSettings.backupEmail}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MFA For Selected Pages (ON / OFF Toggles) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Granular Page-Level MFA Protection (ON / OFF Toggles)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Protect sensitive salon operational areas by enforcing 2-Factor authentication before granting access to specific views.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* 1. Payments & Billing POS */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Payments & Billing / POS</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Require MFA before processing high-value refunds or editing invoice ledgers.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePageMfa("posPayments", !mfaSettings.pageProtection.posPayments)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    mfaSettings.pageProtection.posPayments ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      mfaSettings.pageProtection.posPayments ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 2. Staff Payroll & Salary Structure */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Staff Payroll & Salary Structures</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Require MFA before viewing employee compensations, TDS deductions or payslips.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePageMfa("payrollStructures", !mfaSettings.pageProtection.payrollStructures)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    mfaSettings.pageProtection.payrollStructures ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      mfaSettings.pageProtection.payrollStructures ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 3. Inventory Stock & Costing */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-700 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Inventory Stock & Supplier Costing</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Require MFA before viewing confidential wholesale supplier prices and stock valuation.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePageMfa("inventoryCosting", !mfaSettings.pageProtection.inventoryCosting)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    mfaSettings.pageProtection.inventoryCosting ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      mfaSettings.pageProtection.inventoryCosting ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 4. Customer Directory & Export */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Customer Database & Export</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Require MFA before exporting customer contact directories, phone numbers or CSV files.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePageMfa("customerExport", !mfaSettings.pageProtection.customerExport)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    mfaSettings.pageProtection.customerExport ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      mfaSettings.pageProtection.customerExport ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 5. Branch Creations & Platform */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-700 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Branch Creations & Network Settings</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Require MFA before deploying new salon locations or archiving existing branches.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePageMfa("branchPlatform", !mfaSettings.pageProtection.branchPlatform)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    mfaSettings.pageProtection.branchPlatform ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      mfaSettings.pageProtection.branchPlatform ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 6. Staff Management & HRMS */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 text-violet-700 shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Staff Management & Role Access</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Require MFA before adding new staff user accounts, editing credentials or permissions.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePageMfa("staffManagement", !mfaSettings.pageProtection.staffManagement)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    mfaSettings.pageProtection.staffManagement ? "bg-sky-500" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      mfaSettings.pageProtection.staffManagement ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DISCOUNT & GST TAX CONFIGURATION TAB                                  */}
      {/* ========================================================================= */}
      {activeTab === "discounts" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Master Toggles Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GST Master Switch */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isGstEnabled
                ? "bg-emerald-50/40 border-emerald-200/90 shadow-xs"
                : "bg-slate-50 border-slate-200/80"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    isGstEnabled ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "bg-slate-200 text-slate-500"
                  }`}>
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">GST / Tax Billing Engine</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isGstEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}>
                        {isGstEnabled ? "ENABLED (ACTIVE)" : "DISABLED (OFF)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isGstEnabled
                        ? `Automatically calculating ${gstRatePct}% GST (${cgstRatePct}% CGST + ${sgstRatePct}% SGST) on POS bills.`
                        : "No GST or taxes will be added to customer invoices (Tax Exempt mode)."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextState = !isGstEnabled;
                    setIsGstEnabled(nextState);
                    addToast(
                      nextState ? "success" : "warning",
                      nextState ? "GST Taxes Enabled" : "GST Taxes Disabled",
                      nextState ? "GST tax engine will apply to all new POS bills." : "Invoices will now be tax-free."
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isGstEnabled ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isGstEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Discount Master Switch */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDiscountEnabled
                ? "bg-sky-50/40 border-sky-200/90 shadow-xs"
                : "bg-slate-50 border-slate-200/80"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    isDiscountEnabled ? "bg-sky-600 text-white shadow-md shadow-sky-600/20" : "bg-slate-200 text-slate-500"
                  }`}>
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Discount Matrix Engine</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDiscountEnabled ? "bg-sky-100 text-sky-800" : "bg-slate-200 text-slate-600"
                      }`}>
                        {isDiscountEnabled ? "ENABLED (ACTIVE)" : "DISABLED (OFF)"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isDiscountEnabled
                        ? `Cashier & VIP membership discounts enabled (Max allowed: ${maxCashierDiscountPct}%).`
                        : "All manual and automated invoice discounts are currently disabled."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextState = !isDiscountEnabled;
                    setIsDiscountEnabled(nextState);
                    addToast(
                      nextState ? "success" : "warning",
                      nextState ? "Discounts Enabled" : "Discounts Disabled",
                      nextState ? "Stylists and cashiers can apply configured discounts." : "Discounts locked across all terminals."
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isDiscountEnabled ? "bg-sky-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isDiscountEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Form & Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Detailed Configuration Form */}
            <form onSubmit={handleSaveGstAndDiscounts} className="lg:col-span-7 space-y-6">
              {/* SECTION 1: GST Details & Percentage Setup */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">GST Percentage & Tax Registration</h3>
                      <p className="text-[11px] text-slate-500">
                        Setup Goods and Services Tax breakdown (CGST + SGST) and official GSTIN.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Quick GST Slabs & Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { label: "0% Nil / Exempt", rate: 0 },
                      { label: "5% Essential", rate: 5 },
                      { label: "12% Standard", rate: 12 },
                      { label: "18% Salon Standard", rate: 18 },
                      { label: "28% Ultra Luxury", rate: 28 },
                    ].map((slab) => (
                      <button
                        key={slab.rate}
                        type="button"
                        onClick={() => applyGstPreset(slab.rate)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          gstRatePct === slab.rate
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium"
                        }`}
                      >
                        <div className="text-xs font-bold">{slab.rate}%</div>
                        <div className={`text-[10px] truncate ${gstRatePct === slab.rate ? "text-emerald-100" : "text-slate-500"}`}>
                          {slab.label.split(" ")[1]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Percentage Breakdown Fields with Dynamic On/Off Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                  {/* SGST % */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    isSgstEnabled ? "border-slate-200 bg-slate-50/50" : "border-slate-200/60 bg-slate-100/40 opacity-75"
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-bold text-slate-800">SGST (%)</label>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isSgstEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"
                        }`}>
                          {isSgstEnabled ? "ON" : "OFF"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isSgstEnabled;
                          setIsSgstEnabled(next);
                          addToast("info", next ? "SGST Enabled" : "SGST Disabled", next ? "SGST will be added to bills." : "SGST excluded from bills.");
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          isSgstEnabled ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                        title={isSgstEnabled ? "Turn off SGST" : "Turn on SGST"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            isSgstEnabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        disabled={!isSgstEnabled}
                        value={sgstRatePct}
                        onChange={(e) => handleSgstChange(parseFloat(e.target.value) || 0)}
                        className={`w-full pl-3 pr-7 py-2 rounded-lg border font-mono font-bold text-xs focus:outline-hidden ${
                          isSgstEnabled
                            ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-500"
                            : "border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed"
                        }`}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  {/* CGST % */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    isCgstEnabled ? "border-slate-200 bg-slate-50/50" : "border-slate-200/60 bg-slate-100/40 opacity-75"
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-bold text-slate-800">CGST (%)</label>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isCgstEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"
                        }`}>
                          {isCgstEnabled ? "ON" : "OFF"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isCgstEnabled;
                          setIsCgstEnabled(next);
                          addToast("info", next ? "CGST Enabled" : "CGST Disabled", next ? "CGST will be added to bills." : "CGST excluded from bills.");
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          isCgstEnabled ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                        title={isCgstEnabled ? "Turn off CGST" : "Turn on CGST"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            isCgstEnabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        disabled={!isCgstEnabled}
                        value={cgstRatePct}
                        onChange={(e) => handleCgstChange(parseFloat(e.target.value) || 0)}
                        className={`w-full pl-3 pr-7 py-2 rounded-lg border font-mono font-bold text-xs focus:outline-hidden ${
                          isCgstEnabled
                            ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-500"
                            : "border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed"
                        }`}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  {/* IGST % */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    isIgstEnabled ? "border-slate-200 bg-slate-50/50" : "border-slate-200/60 bg-slate-100/40 opacity-75"
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-bold text-slate-800">IGST (%)</label>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          isIgstEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"
                        }`}>
                          {isIgstEnabled ? "ON" : "OFF"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isIgstEnabled;
                          setIsIgstEnabled(next);
                          addToast("info", next ? "IGST Enabled" : "IGST Disabled", next ? "IGST will be added to bills." : "IGST excluded from bills.");
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          isIgstEnabled ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                        title={isIgstEnabled ? "Turn off IGST" : "Turn on IGST"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            isIgstEnabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        disabled={!isIgstEnabled}
                        value={igstRatePct}
                        onChange={(e) => setIgstRatePct(parseFloat(e.target.value) || 0)}
                        className={`w-full pl-3 pr-7 py-2 rounded-lg border font-mono font-bold text-xs focus:outline-hidden ${
                          isIgstEnabled
                            ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-500"
                            : "border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed"
                        }`}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  {/* Total GST % */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-emerald-900">Total GST Rate</label>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        {[
                          isSgstEnabled ? `SGST ${sgstRatePct}%` : null,
                          isCgstEnabled ? `CGST ${cgstRatePct}%` : null,
                          isIgstEnabled ? `IGST ${igstRatePct}%` : null,
                        ].filter(Boolean).join(" + ") || "None (0%)"}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={
                          isGstEnabled
                            ? Number(
                                (
                                  (isSgstEnabled ? sgstRatePct : 0) +
                                  (isCgstEnabled ? cgstRatePct : 0) +
                                  (isIgstEnabled ? igstRatePct : 0)
                                ).toFixed(2)
                              )
                            : 0
                        }
                        readOnly
                        className="w-full pl-3 pr-7 py-2 rounded-lg border border-emerald-300 bg-white font-mono font-bold text-xs text-emerald-900 focus:outline-hidden cursor-default"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Mode and GSTIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tax Pricing Mode
                    </label>
                    <select
                      value={taxPricingMode}
                      onChange={(e) => setTaxPricingMode(e.target.value as "exclusive" | "inclusive")}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="exclusive">Exclusive (GST added on top of base bill price)</option>
                      <option value="inclusive">Inclusive (Service price already contains GST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Salon GSTIN Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-xs text-slate-900 uppercase focus:bg-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Service HSN / SAC Code
                    </label>
                    <input
                      type="text"
                      value={hsnSacCode}
                      onChange={(e) => setHsnSacCode(e.target.value)}
                      placeholder="e.g. 999721 (Beauty Services)"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Discount Matrix & Guardrails */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Discount Matrix & Preset Configurations</h3>
                      <p className="text-[11px] text-slate-500">
                        Configure POS discount presets, cashier guardrails, and membership tier discounts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Presets Editor */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    POS Discount Quick-Pills
                  </label>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {discountPresets.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold shadow-2xs"
                      >
                        <span>{p}%</span>
                        {discountPresets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePreset(p)}
                            className="text-sky-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove preset"
                          >
                            &times;
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newPresetInput}
                      onChange={(e) => setNewPresetInput(e.target.value)}
                      placeholder="Add % preset (e.g. 35)"
                      className="w-40 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddPreset}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Add Preset
                    </button>
                  </div>
                </div>

                {/* Max Cashier Discount & Sequence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Max Allowed Staff Discount</label>
                      <span className="text-xs font-mono font-bold text-sky-600">{maxCashierDiscountPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={maxCashierDiscountPct}
                      onChange={(e) => setMaxCashierDiscountPct(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Staff cannot exceed this limit without owner biometric or override pin.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Discount Calculation Sequence
                    </label>
                    <select
                      value={applyDiscountBeforeTax ? "before" : "after"}
                      onChange={(e) => setApplyDiscountBeforeTax(e.target.value === "before")}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
                    >
                      <option value="before">Apply Discount BEFORE GST (Standard & Compliant)</option>
                      <option value="after">Apply Discount AFTER GST Total</option>
                    </select>
                  </div>
                </div>

                {/* Membership Tier Automatic Discounts */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Membership Tier Auto-Discount (%)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Regular</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={membershipDiscounts.regular}
                        onChange={(e) =>
                          setMembershipDiscounts({ ...membershipDiscounts, regular: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-900 focus:bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Silver (10%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={membershipDiscounts.silver}
                        onChange={(e) =>
                          setMembershipDiscounts({ ...membershipDiscounts, silver: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-900 focus:bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">Gold (15%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={membershipDiscounts.gold}
                        onChange={(e) =>
                          setMembershipDiscounts({ ...membershipDiscounts, gold: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-900 focus:bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-violet-600 uppercase block mb-1">Platinum (20%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={membershipDiscounts.platinum}
                        onChange={(e) =>
                          setMembershipDiscounts({ ...membershipDiscounts, platinum: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit & Save Changes */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Apply GST & Discount Settings</span>
                </button>
              </div>
            </form>

            {/* Right 5 Cols: Live Receipt & Math Simulator */}
            <div className="lg:col-span-5 space-y-6">
              {/* Interactive Calculation Simulator Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Live Tax & Invoice Simulator</h3>
                      <p className="text-[11px] text-slate-500">Real-time breakdown of bill math</p>
                    </div>
                  </div>
                </div>

                {/* Simulator Controls */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Test Bill Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="100"
                      value={simServiceAmount}
                      onChange={(e) => setSimServiceAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Test Discount (%):</label>
                      <span className="font-mono font-bold text-sky-600">{simDiscountPct}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[0, 5, 10, 15, 20, 25].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setSimDiscountPct(pct)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                            simDiscountPct === pct
                              ? "bg-sky-600 text-white"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Math Calculation Result */}
                {(() => {
                  const gross = simServiceAmount;
                  const discountVal = isDiscountEnabled ? Math.round((gross * simDiscountPct) / 100) : 0;
                  const netTaxable = Math.max(0, gross - discountVal);
                  
                  const activeCgstPct = isGstEnabled && isCgstEnabled ? cgstRatePct : 0;
                  const activeSgstPct = isGstEnabled && isSgstEnabled ? sgstRatePct : 0;
                  const activeIgstPct = isGstEnabled && isIgstEnabled ? igstRatePct : 0;

                  const cgstAmount = Math.round((netTaxable * activeCgstPct) / 100);
                  const sgstAmount = Math.round((netTaxable * activeSgstPct) / 100);
                  const igstAmount = Math.round((netTaxable * activeIgstPct) / 100);

                  const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
                  const totalPayable = netTaxable + totalTaxAmount;
                  const totalActiveGstPct = activeCgstPct + activeSgstPct + activeIgstPct;

                  return (
                    <div className="space-y-4">
                      {/* Thermal Receipt Visual Preview */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 space-y-2 shadow-inner">
                        <div className="text-center pb-2 border-b border-dashed border-slate-300">
                          <div className="font-bold text-slate-900 text-xs">LAZYMONKEY AI LUXURY ATELIER</div>
                          <div className="text-[10px] text-slate-500">GSTIN: {gstin || "N/A"}</div>
                          <div className="text-[10px] text-slate-500">SAC: {hsnSacCode}</div>
                        </div>

                        <div className="space-y-1 py-1">
                          <div className="flex justify-between">
                            <span>1x Luxury Hair Spa & Treatment</span>
                            <span className="font-bold">₹{gross.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
                          <div className="flex justify-between text-slate-600">
                            <span>Gross Subtotal:</span>
                            <span>₹{gross.toLocaleString()}</span>
                          </div>

                          {isDiscountEnabled && discountVal > 0 ? (
                            <div className="flex justify-between text-emerald-700 font-bold">
                              <span>Special Discount ({simDiscountPct}%):</span>
                              <span>-₹{discountVal.toLocaleString()}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-slate-400">
                              <span>Discount:</span>
                              <span>{isDiscountEnabled ? "₹0" : "Disabled (OFF)"}</span>
                            </div>
                          )}

                          <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                            <span>Net Taxable Value:</span>
                            <span>₹{netTaxable.toLocaleString()}</span>
                          </div>

                          {isGstEnabled && totalTaxAmount > 0 ? (
                            <>
                              {isCgstEnabled && cgstAmount > 0 && (
                                <div className="flex justify-between text-slate-600">
                                  <span>CGST ({cgstRatePct}%):</span>
                                  <span>₹{cgstAmount.toLocaleString()}</span>
                                </div>
                              )}
                              {isSgstEnabled && sgstAmount > 0 && (
                                <div className="flex justify-between text-slate-600">
                                  <span>SGST ({sgstRatePct}%):</span>
                                  <span>₹{sgstAmount.toLocaleString()}</span>
                                </div>
                              )}
                              {isIgstEnabled && igstAmount > 0 && (
                                <div className="flex justify-between text-slate-600">
                                  <span>IGST ({igstRatePct}%):</span>
                                  <span>₹{igstAmount.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-emerald-800 font-bold border-t border-dashed border-slate-200 pt-1">
                                <span>Total Tax ({totalActiveGstPct}%):</span>
                                <span>₹{totalTaxAmount.toLocaleString()}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                              <span>GST Tax:</span>
                              <span>₹0 (Tax Disabled)</span>
                            </div>
                          )}
                        </div>

                        <div className="border-t-2 border-dashed border-slate-400 pt-2 flex justify-between font-bold text-sm text-slate-950">
                          <span>TOTAL PAYABLE:</span>
                          <span>₹{totalPayable.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Info Alert */}
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-2.5 text-xs text-sky-800">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Active Engine Status: </span>
                          <span>
                            {isGstEnabled
                              ? `Taxes: ${[
                                  isSgstEnabled ? `SGST ${sgstRatePct}%` : null,
                                  isCgstEnabled ? `CGST ${cgstRatePct}%` : null,
                                  isIgstEnabled ? `IGST ${igstRatePct}%` : null,
                                ].filter(Boolean).join(", ") || "None Enabled"}.`
                              : "GST is disabled."}{" "}
                            {isDiscountEnabled ? `Discounts active up to ${maxCashierDiscountPct}%.` : "Discounts locked."}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DATA IMPORT & SAMPLE CSV / EXCEL HUB TAB                                */}
      {/* ========================================================================= */}
      {activeTab === "data-hub" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 backdrop-blur-md">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Bulk Data Import & Sample Generator Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Import CSV / Excel & Sample Templates
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Download pre-formatted sample CSV spreadsheets with dummy data, or upload your own CSV / Excel files to dump bulk data into Services, Customers, and Inventory catalogs.
              </p>
            </div>
          </div>

          {/* 3 Core Import Modules Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1: Services */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-pink-50 text-pink-700 border border-pink-100">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-800">
                    {services.length} Active Services
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Services & Treatments</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Service name, category, duration, base price, and gender assignment.
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-2.5">
                <button
                  onClick={() => {
                    downloadCsvFile("Sample_Salon_Services_Catalog.csv", SAMPLE_SERVICES_CSV);
                    addToast("success", "Sample Downloaded", "Sample services CSV template saved.");
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Sample CSV</span>
                </button>

                <button
                  onClick={() => handleOpenImport("services")}
                  className="w-full py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Services CSV / Excel</span>
                </button>
              </div>
            </div>

            {/* Module 2: Customers */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                    {customers.length} Guests in CRM
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Customers & Clients</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Full name, phone number, email, VIP membership tier, and wallet balances.
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-2.5">
                <button
                  onClick={() => {
                    downloadCsvFile("Sample_Salon_Customers_Directory.csv", SAMPLE_CUSTOMERS_CSV);
                    addToast("success", "Sample Downloaded", "Sample customer CRM CSV template saved.");
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Sample CSV</span>
                </button>

                <button
                  onClick={() => handleOpenImport("customers")}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Customers CSV / Excel</span>
                </button>
              </div>
            </div>

            {/* Module 3: Inventory */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                    <Database className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    {inventory.length} Stock Items
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Inventory & Products</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    SKU codes, brand, unit type, cost price, retail price, and stock levels.
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-2.5">
                <button
                  onClick={() => {
                    downloadCsvFile("Sample_Salon_Inventory_Stock.csv", SAMPLE_INVENTORY_CSV);
                    addToast("success", "Sample Downloaded", "Sample inventory stock CSV template saved.");
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Sample CSV</span>
                </button>

                <button
                  onClick={() => handleOpenImport("inventory")}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.01]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Inventory CSV / Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV / Excel Data Importer Modal */}
      <DataImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        dataType={importModalType}
      />

      {/* ========================================================================= */}
      {/* CREATE NEW SALON BRANCH MODAL                                             */}
      {/* 1. Basic Info | 2. Contact | 3. Location | 5. Branding                   */}
      {/* ========================================================================= */}
      {isCreateBranchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Create New Salon Branch</h3>
                  <p className="text-xs text-slate-500">
                    Deploy a new physical luxury location with comprehensive branch metadata.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateBranchOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleCreateBranchSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* ------------------------------------------------------------- */}
              {/* SECTION 1: BASIC INFORMATION                                 */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Basic Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Branch Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="e.g. Atelier Indiranagar Flagship"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Branch Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      placeholder="e.g. BLR-IND-01"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Branch Type *
                    </label>
                    <select
                      value={branchType}
                      onChange={(e) => setBranchType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
                    >
                      <option value="Flagship Studio">Flagship Studio</option>
                      <option value="Luxury Suite">Luxury Suite</option>
                      <option value="Express Bar">Express Bar</option>
                      <option value="Franchise Partner">Franchise Partner</option>
                      <option value="Resort Spa">Resort Spa</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Branch Manager *
                    </label>
                    <input
                      type="text"
                      required
                      value={branchManager}
                      onChange={(e) => setBranchManager(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Status *
                    </label>
                    <select
                      value={branchStatus}
                      onChange={(e) => setBranchStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
                    >
                      <option value="active">Active (Operational)</option>
                      <option value="opening_soon">Opening Soon</option>
                      <option value="under_renovation">Under Renovation</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SECTION 2: CONTACT INFORMATION                               */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Contact Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Official Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                      placeholder="+91 80 4122 8899"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Branch Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={branchEmail}
                      onChange={(e) => setBranchEmail(e.target.value)}
                      placeholder="indiranagar@lazymonkeyai.luxury"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      WhatsApp Booking Number
                    </label>
                    <input
                      type="text"
                      value={branchWhatsapp}
                      onChange={(e) => setBranchWhatsapp(e.target.value)}
                      placeholder="+91 98200 99881"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SECTION 3: LOCATION                                          */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Location & Coordinates</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder="Level 2, 100 Feet Road, HAL 2nd Stage"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      placeholder="Bengaluru"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      required
                      value={branchState}
                      onChange={(e) => setBranchState(e.target.value)}
                      placeholder="Karnataka"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={branchCountry}
                      onChange={(e) => setBranchCountry(e.target.value)}
                      placeholder="India"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      PIN / Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={branchPinCode}
                      onChange={(e) => setBranchPinCode(e.target.value)}
                      placeholder="560038"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Map Location (Coordinates or Maps URL)
                  </label>
                  <input
                    type="text"
                    value={branchMapLocation}
                    onChange={(e) => setBranchMapLocation(e.target.value)}
                    placeholder="12.9716° N, 77.5946° E or https://maps.google.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SECTION 5: BRANDING & OPERATIONS                             */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-bold">5</span>
                  <span>Branding & Operational Setup</span>
                </div>

                {/* Logo & Image Upload Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Branch Cover Image */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Branch Cover Photo</label>
                      <label
                        htmlFor="branch-cover-upload"
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload</span>
                        <input
                          id="branch-cover-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleBranchImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                      <img src={branchImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>

                    <input
                      type="text"
                      value={branchImage}
                      onChange={(e) => setBranchImage(e.target.value)}
                      placeholder="Image URL"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-900 bg-white focus:outline-hidden"
                    />
                  </div>

                  {/* Branch Logo */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Branch Logo / Emblem</label>
                      <label
                        htmlFor="branch-logo-upload"
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload</span>
                        <input
                          id="branch-logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleBranchLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="h-24 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-2">
                      <img src={branchLogo} alt="Logo Preview" className="max-h-full object-contain rounded-lg" />
                    </div>

                    <input
                      type="text"
                      value={branchLogo}
                      onChange={(e) => setBranchLogo(e.target.value)}
                      placeholder="Logo URL"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-900 bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Preset Imagery */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    Or Select Preset Architectural Theme:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_BRANCH_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBranchImage(preset.img)}
                        className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                          branchImage === preset.img
                            ? "border-sky-500 ring-2 ring-sky-300 bg-sky-50/50"
                            : "border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <img src={preset.img} alt={preset.label} className="w-full h-12 rounded-lg object-cover mb-1" />
                        <span className="text-[10px] font-medium text-slate-700 truncate block">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Branch Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Branch Description & Amenities *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={branchDescription}
                    onChange={(e) => setBranchDescription(e.target.value)}
                    placeholder="Describe the salon ambiance, VIP services, private lounges..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                {/* Operational Details (Currency, Tax, Chairs, Hours) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Currency</label>
                    <select
                      value={branchCurrency}
                      onChange={(e) => setBranchCurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tax / GST (%)</label>
                    <input
                      type="number"
                      value={branchTaxRate}
                      onChange={(e) => setBranchTaxRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Stylist Chairs</label>
                    <input
                      type="number"
                      value={branchChairs}
                      onChange={(e) => setBranchChairs(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Operating Hours</label>
                    <input
                      type="text"
                      value={branchHours}
                      onChange={(e) => setBranchHours(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateBranchOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                >
                  Create & Launch Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

