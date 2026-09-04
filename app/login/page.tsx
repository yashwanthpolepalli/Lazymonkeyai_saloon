'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase, UserRole } from '@/lib/supabase/client';
import { Scissors, User, Building2, Users, Shield, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'signin' | 'signup';

const roleConfig: Record<UserRole, { label: string; icon: any; description: string; color: string }> = {
  customer: { label: 'Customer', icon: User, description: 'Book appointments, manage memberships & wallet', color: 'from-blue-500 to-blue-600' },
  owner: { label: 'Salon Owner', icon: Building2, description: 'Manage services, staff, bookings & analytics', color: 'from-primary to-primary/80' },
  staff: { label: 'Staff', icon: Users, description: 'View appointments, manage customers & sales', color: 'from-green-500 to-green-600' },
  super_admin: { label: 'Super Admin', icon: Shield, description: 'Platform control, organizations & subscriptions', color: 'from-slate-700 to-slate-800' },
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole | null;
    if (roleParam && roleConfig[roleParam]) setSelectedRole(roleParam);
    if (searchParams.get('mode') === 'signup') setMode('signup');
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user && role) {
      if (role === 'owner') router.push('/admin');
      else if (role === 'staff') router.push('/staff');
      else if (role === 'super_admin') router.push('/platform');
      else router.push('/app');
    }
  }, [user, role, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'signup' && !name) return;

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Welcome back!');
        }
      } else {
        const { error } = await signUp(email, password, name, selectedRole);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Account created! Please sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-primary/70">
        <img
          src="https://images.pexels.com/photos/13068377/pexels-photo-13068377.jpeg?auto=compress&cs=tinysrgb&h=900&w=800"
          alt="Luxury salon"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="font-display text-xl font-bold">LazyMonkeyAI Salon OS</span>
          </Link>

          <div>
            <h1 className="font-display text-5xl font-bold mb-4 leading-tight">
              {mode === 'signin' ? 'Welcome back to luxury' : 'Begin your salon journey'}
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              The AI-powered salon operating system. Book appointments, manage your salon, and grow your business.
            </p>
          </div>

          <div className="space-y-3">
            {['Multi-branch salon management', 'Role-based access control', 'AI-powered booking engine', 'Real-time availability'].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm text-primary-foreground/90">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">LazyMonkeyAI</span>
            </Link>
          </div>

          <h2 className="font-display text-3xl font-bold mb-2">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {mode === 'signin' ? 'Choose your role and sign in to continue' : 'Select your role and create your account'}
          </p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(Object.keys(roleConfig) as UserRole[]).map((r) => {
              const cfg = roleConfig[r];
              const Icon = cfg.icon;
              const isSelected = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-accent shadow-luxe'
                      : 'border-border hover:border-primary/30 bg-card'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{cfg.label}</p>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mb-6 px-1">
            {roleConfig[selectedRole].description}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-luxe disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary font-semibold hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
