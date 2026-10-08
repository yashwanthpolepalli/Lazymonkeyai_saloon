"use client";

import React, { useState } from "react";
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useSalon } from "@/context/SalonContext";
import { BusinessType, Organization } from "@/types";
import { AuthService, OrganizationService } from "@/services/apiClient";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const {
    organizations,
    currentOrganization,
    setOrganization,
    loginUser,
    setActiveRole,
    setActiveSubTab,
    addToast,
  } = useSalon();

  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    currentOrganization?.id || (organizations[0]?.id || "")
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // New Organization Registration Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgCode, setNewOrgCode] = useState("");
  const [newBusinessType, setNewBusinessType] = useState<BusinessType>("general");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const activeOrg = organizations.find((o) => o.id === selectedOrgId) || organizations[0] || null;

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setOrganization(org);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email.trim() || !password.trim()) {
      setLoginError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AuthService.login({
        email: email.trim(),
        password,
        organization_id: activeOrg?.id || "",
      });

      if (res && res.user && res.access_token) {
        loginUser(res.user, res.access_token);
        addToast("success", "Authenticated", `Welcome back, ${res.user.name}`);
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setLoginError("Invalid response from server. Please try again.");
      }
    } catch (err: any) {
      const msg =
        err?.message ||
        "Login failed. Please check your credentials.";
      setLoginError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      addToast("error", "Missing Fields", "Organization name, admin email, and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const code = newOrgCode.trim() || newOrgName.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 10);
      const newOrgPayload = {
        name: newOrgName,
        code,
        business_type: newBusinessType,
        currency: "INR",
        tax_rate: newBusinessType === "institution_public" ? 0.0 : 0.18,
        email: adminEmail,
      };

      const createdOrg = await OrganizationService.createOrganization(newOrgPayload);
      if (!createdOrg) throw new Error("Failed to create organization on server.");

      // Register the admin user on the backend
      const registeredUser = await AuthService.register({
        name: adminName || `${newOrgName} Director`,
        email: adminEmail,
        password: adminPassword,
        role: "owner",
        organization_id: createdOrg.id,
      });

      if (registeredUser?.user && registeredUser?.access_token) {
        setOrganization(createdOrg);
        setSelectedOrgId(createdOrg.id);
        loginUser(registeredUser.user, registeredUser.access_token);
        setShowRegisterModal(false);
        addToast("success", "Organization Provisioned", `${newOrgName} workspace is ready.`);
        if (onLoginSuccess) onLoginSuccess();
      } else {
        throw new Error("Registration succeeded but no user session returned.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to provision organization.";
      addToast("error", "Registration Failed", msg);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-white flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-amber-500/20 text-sm">
            OS
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-tight">
              {activeOrg?.name || " LazyMonkeyai Salon"}
            </span>
            <span className="text-[11px] text-slate-400">Universal Multi-Tenant Salon Platform</span>
          </div>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          Create New Salon / Institution
        </button>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Operating Models & Sector Architecture */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Policy-Driven Multi-Sector Architecture</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            One Unified Engine for <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">Every Operating Model</span>
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Select an organization profile to dynamically adapt workflows, permissions, and module configurations from independent salons to multi-branch enterprises and institutional facilities.
          </p>

          {/* Organization / Business Profile Switcher Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {organizations.map((org) => {
              const isSelected = org.id === selectedOrgId;
              return (
                <button
                  key={org.id}
                  onClick={() => handleOrgChange(org.id)}
                  className={`p-4 rounded-2xl text-left border transition relative cursor-pointer ${isSelected
                      ? "bg-slate-800/90 border-amber-400/80 shadow-lg shadow-amber-500/10"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 block mb-1">
                    {org.business_type.replace("_", " ")}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-tight">{org.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{org.brand_tagline}</p>
                </button>
              );
            })}
          </div>

          {/* Dynamic Active Policy Indicators */}
          {activeOrg?.policy_config && (
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Policy Engine Features:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className={`px-2.5 py-1 rounded-lg border ${activeOrg.policy_config.multi_branch_enabled ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                  {activeOrg.policy_config.multi_branch_enabled ? "✓ Multi-Branch" : "Single Branch"}
                </span>
                <span className={`px-2.5 py-1 rounded-lg border ${activeOrg.policy_config.approval_required ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
                  {activeOrg.policy_config.approval_required ? "✓ Approval Workflows" : "Direct Approval"}
                </span>
                <span className={`px-2.5 py-1 rounded-lg border ${activeOrg.policy_config.internal_entitlement_mode ? "bg-purple-500/10 border-purple-500/30 text-purple-300" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"}`}>
                  {activeOrg.policy_config.internal_entitlement_mode ? "✓ Welfare Entitlements" : "✓ Commercial POS"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Secure Login Form */}
        <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Secure Sign In</h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials to access{" "}
              <span className="text-amber-400 font-semibold">{activeOrg?.name || "your workspace"}</span>.
              Your role and permissions will be loaded automatically.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="login-email"
                  type="text"
                  placeholder="your.name@salon.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoginError(null); }}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(null); }}
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-xs text-red-300">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to {activeOrg?.name || "Workspace"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-500">
              Credentials are issued by your administrator. Contact your manager if you cannot access your account.
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto text-center py-2 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/60 pt-4 gap-2">
        <span>© 2026 Salon OS &bull; High-Performance  LazyMonkeyai Salon</span>
        <span>Supports General Salons &bull; Enterprise Chains &bull; Public / Institutional Facilities</span>
      </footer>

      {/* Modal: Create New Organization / Salon */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Provision New Salon / Organization</h3>
                <p className="text-xs text-slate-400">Configure operating profile and policy engine on the fly.</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterOrganization} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Organization / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Crown Spa & Aesthetics"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Business Operating Model</label>
                  <select
                    value={newBusinessType}
                    onChange={(e) => setNewBusinessType(e.target.value as BusinessType)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="general">General / Single Salon</option>
                    <option value="enterprise_chain">Private Multi-Branch Chain</option>
                    <option value="institution_public">Government / Public Institution</option>
                    <option value="franchise">Franchise Network</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Organization Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ROYAL_01"
                    value={newOrgCode}
                    onChange={(e) => setNewOrgCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Director / Admin Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@salon.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Admin Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Set initial password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800 hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer shadow-md disabled:opacity-60"
                >
                  {isSubmitting ? "Provisioning..." : "Create & Launch Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
