'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  Scissors, Sparkles, Heart, Hand, Palette, User, Crown, Flower2,
  Star, MapPin, Clock, ArrowRight, Calendar, Zap, Shield, Award,
  Menu, X, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type {
  DatabaseBranch, DatabaseServiceCategory, DatabaseStaff, DatabaseReview, DatabaseOffer
} from '@/lib/supabase/client';

const heroImage = 'https://images.pexels.com/photos/13068377/pexels-photo-13068377.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600';
const salonImage2 = 'https://images.pexels.com/photos/7750114/pexels-photo-7750114.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const salonImage3 = 'https://images.pexels.com/photos/7195803/pexels-photo-7195803.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const categoryIcons: Record<string, any> = {
  Scissors, Sparkles, Heart, Hand, Palette, User, Crown, Flower2
};

export default function HomePage() {
  const { user, role } = useAuth();
  const [branches, setBranches] = useState<DatabaseBranch[]>([]);
  const [categories, setCategories] = useState<DatabaseServiceCategory[]>([]);
  const [staff, setStaff] = useState<DatabaseStaff[]>([]);
  const [reviews, setReviews] = useState<DatabaseReview[]>([]);
  const [offers, setOffers] = useState<DatabaseOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: branchData }, { data: catData }, { data: staffData }, { data: reviewData }, { data: offerData }] = await Promise.all([
        supabase.from('branches').select('*').eq('status', 'active').order('rating', { ascending: false }),
        supabase.from('service_categories').select('*').order('display_order'),
        supabase.from('staff').select('*').eq('status', 'active').order('rating', { ascending: false }).limit(4),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('offers').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(3),
      ]);
      setBranches(branchData as DatabaseBranch[] || []);
      setCategories(catData as DatabaseServiceCategory[] || []);
      setStaff(staffData as DatabaseStaff[] || []);
      setReviews(reviewData as DatabaseReview[] || []);
      setOffers(offerData as DatabaseOffer[] || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-luxe group-hover:scale-105 transition-transform">
                <Scissors className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display text-lg md:text-xl font-bold tracking-tight">LazyMonkeyAI</span>
                <span className="hidden md:inline text-xs text-muted-foreground ml-1">Salon OS</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/salons" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Salons</Link>
              <Link href="/services" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Services</Link>
              <Link href="/membership" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Membership</Link>
              <Link href="/offers" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Offers</Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Link
                  href={role === 'owner' ? '/admin' : role === 'staff' ? '/staff' : '/app'}
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-luxe"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="px-5 py-2.5 rounded-full text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
                    Sign In
                  </Link>
                  <Link
                    href="/book"
                    className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-luxe"
                  >
                    Book Appointment
                  </Link>
                </>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-3">
              <Link href="/salons" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Salons</Link>
              <Link href="/services" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Services</Link>
              <Link href="/membership" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Membership</Link>
              <Link href="/offers" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Offers</Link>
              <div className="pt-3 flex gap-2">
                {user ? (
                  <Link href={role === 'owner' ? '/admin' : role === 'staff' ? '/staff' : '/app'} className="flex-1 text-center px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="flex-1 text-center px-4 py-2.5 rounded-full text-sm font-semibold border border-border" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    <Link href="/book" className="flex-1 text-center px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>Book</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 md:pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Luxury salon" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Salon Operating System</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 animate-slide-up">
              Look Good.
              <br />
              Feel <span className="text-gradient-primary">Unstoppable.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Personalized beauty & grooming at premium salons near you. Book appointments, explore services, and manage your salon experience — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                href="/book"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-all shadow-luxe-lg hover:scale-[1.02]"
              >
                <Calendar className="w-5 h-5" />
                Book Appointment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/salons"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-background/80 backdrop-blur border border-border text-base font-semibold hover:bg-secondary transition-all"
              >
                Explore Salons
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {staff.slice(0, 3).map((s, i) => (
                    <div key={s.id} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary/40 border-2 border-background flex items-center justify-center text-xs font-semibold text-primary-foreground">
                      {s.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Expert stylists</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-gold text-gold" />
                <span className="text-sm font-semibold">4.8</span>
                <span className="text-sm text-muted-foreground">(1,092 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Secure Booking
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Instant Confirmation
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Verified Salons
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Free Rescheduling
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Explore Services</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-4">Everything Beauty, In One Place</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From hair to skin, nails to makeup — discover premium services tailored to you.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, idx) => {
              const Icon = categoryIcons[cat.icon] || Sparkles;
              return (
                <Link
                  key={cat.id}
                  href={`/services?category=${cat.slug}`}
                  className="group relative p-6 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-luxe transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-semibold mb-1">{cat.name}</h3>
                  {cat.gender_filter && (
                    <span className="text-xs text-muted-foreground">{cat.gender_filter}</span>
                  )}
                  <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Salons */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Premium Salons</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">Salons Near You</h2>
            </div>
            <Link href="/salons" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              View all salons <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {branches.map((branch, idx) => (
              <Link
                key={branch.id}
                href={`/salons/${branch.slug}`}
                className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-luxe-lg transition-all animate-slide-up"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={idx % 2 === 0 ? salonImage2 : salonImage3}
                    alt={branch.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full glass-strong text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    {Number(branch.rating).toFixed(1)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{branch.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {branch.locality}, {branch.city}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {branch.opening_time} - {branch.closing_time}
                    </div>
                    <span className="text-xs text-muted-foreground">{branch.review_count} reviews</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offers Banner */}
      {offers.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Special Offers</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-4">Save On Your Next Visit</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offers.map((offer, idx) => (
                <div
                  key={offer.id}
                  className="relative p-8 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                  <div className="relative z-10">
                    <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-4">
                      {offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-primary-foreground/80 text-sm mb-4">{offer.description}</p>
                    <div className="flex items-center justify-between">
                      <code className="px-3 py-1.5 rounded-lg bg-white/20 text-sm font-mono font-bold">{offer.code}</code>
                      <Link href="/book" className="text-sm font-semibold underline">Book Now →</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Stylists */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Meet The Experts</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-2 mb-4">Top Rated Stylists</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experienced professionals dedicated to making you look your best.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {staff.map((member, idx) => (
              <div
                key={member.id}
                className="group text-center animate-slide-up"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 transition-all" />
                  <div className="absolute inset-2 rounded-full overflow-hidden bg-accent flex items-center justify-center">
                    <span className="font-display text-4xl md:text-5xl font-bold text-primary/40">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{member.designation}</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="text-sm font-semibold">{Number(member.rating).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({member.review_count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Customer Love</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mt-2">What Our Clients Say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, idx) => (
                <div
                  key={review.id}
                  className="p-6 rounded-2xl bg-card border border-border animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-foreground/80 leading-relaxed mb-4">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-semibold text-accent-foreground">
                      C
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Verified Customer</p>
                      <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-primary/70 p-12 md:p-16 text-center text-primary-foreground">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 translate-y-32" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Ready For Your Transformation?</h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Book your appointment today and experience the premium salon difference.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-background text-foreground text-base font-semibold hover:bg-background/90 transition-all shadow-luxe"
              >
                <Calendar className="w-5 h-5" />
                Book Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display text-lg font-bold">LazyMonkeyAI</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-Powered Salon Operating System</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/services?category=hair" className="hover:text-primary">Hair</Link></li>
                <li><Link href="/services?category=skin" className="hover:text-primary">Skin</Link></li>
                <li><Link href="/services?category=makeup" className="hover:text-primary">Makeup</Link></li>
                <li><Link href="/services?category=grooming" className="hover:text-primary">Grooming</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/salons" className="hover:text-primary">Salons</Link></li>
                <li><Link href="/membership" className="hover:text-primary">Membership</Link></li>
                <li><Link href="/offers" className="hover:text-primary">Offers</Link></li>
                <li><Link href="/login" className="hover:text-primary">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">For Business</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login?role=owner" className="hover:text-primary">Owner Dashboard</Link></li>
                <li><Link href="/login?role=staff" className="hover:text-primary">Staff Portal</Link></li>
                <li><Link href="/platform" className="hover:text-primary">Platform Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2026 LazyMonkeyAI Salon OS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
