'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { DatabaseBranch, DatabaseStaff, DatabaseReview, DatabaseSalonService, DatabaseGlobalService, DatabaseServiceCategory } from '@/lib/supabase/client';
import { Star, MapPin, Clock, Phone, ArrowRight, Scissors, Calendar, ChevronLeft, Sparkles } from 'lucide-react';

const salonImages = [
  'https://images.pexels.com/photos/7750114/pexels-photo-7750114.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7195800/pexels-photo-7195800.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7195809/pexels-photo-7195809.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

interface ServiceWithDetails extends DatabaseSalonService {
  global_service: DatabaseGlobalService;
  pricing: { price: number; duration_min: number; stylist_level: string; hair_length: string | null }[];
}

export default function SalonDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [branch, setBranch] = useState<DatabaseBranch | null>(null);
  const [staff, setStaff] = useState<DatabaseStaff[]>([]);
  const [reviews, setReviews] = useState<DatabaseReview[]>([]);
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'stylists' | 'reviews'>('services');
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data: branchData } = await supabase
        .from('branches')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setBranch(branchData as DatabaseBranch | null);

      if (branchData) {
        const [staffRes, reviewsRes, servicesRes, pricingRes] = await Promise.all([
          supabase.from('staff').select('*').eq('branch_id', branchData.id).eq('status', 'active'),
          supabase.from('reviews').select('*').eq('branch_id', branchData.id).order('created_at', { ascending: false }),
          supabase.from('salon_services').select('*, global_service:global_services(*)').eq('branch_id', branchData.id).eq('status', 'active'),
          supabase.from('service_pricing').select('*').eq('branch_id', branchData.id),
        ]);

        setStaff(staffRes.data as DatabaseStaff[] || []);
        setReviews(reviewsRes.data as DatabaseReview[] || []);

        const salonServices = (servicesRes.data as any[]) || [];
        const pricing = (pricingRes.data as any[]) || [];

        const servicesWithPricing: ServiceWithDetails[] = salonServices.map(ss => ({
          ...ss,
          pricing: pricing.filter(p => p.salon_service_id === ss.id).map(p => ({
            price: p.price,
            duration_min: p.duration_min,
            stylist_level: p.stylist_level,
            hair_length: p.hair_length,
          })),
        }));
        setServices(servicesWithPricing);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="h-64 bg-muted rounded-2xl animate-pulse mb-6" />
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse mb-4" />
          <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Salon not found.</p>
          <Link href="/salons" className="text-primary font-semibold hover:underline mt-2 inline-block">Back to salons</Link>
        </div>
      </div>
    );
  }

  const minPrice = (svc: ServiceWithDetails) => {
    if (!svc.pricing.length) return 0;
    return Math.min(...svc.pricing.map(p => p.price));
  };

  const filteredServices = genderFilter === 'all'
    ? services
    : services.filter(s => s.global_service.gender === genderFilter || s.global_service.gender === 'Unisex');

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img src={salonImages[0]} alt={branch.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <Link href="/salons" className="inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground mb-4">
              <ChevronLeft className="w-4 h-4" /> All Salons
            </Link>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-2">{branch.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-primary-foreground/90">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-gold text-gold" />
                <span className="font-semibold">{Number(branch.rating).toFixed(1)}</span>
                <span className="text-sm">({branch.review_count} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {branch.address}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4" />
                Open · Closes {branch.closing_time}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 md:top-20 z-30 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {([
              { key: 'services', label: 'Services' },
              { key: 'stylists', label: 'Stylists' },
              { key: 'reviews', label: 'Reviews' },
              { key: 'about', label: 'About' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-1">Our Services</h2>
                <p className="text-muted-foreground">Choose from our premium salon services</p>
              </div>
              <div className="flex gap-2">
                {['all', 'Women', 'Men', 'Unisex'].map(g => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      genderFilter === g
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-accent'
                    }`}
                  >
                    {g === 'all' ? 'All' : g}
                  </button>
                ))}
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="text-center py-16">
                <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No services available for this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((svc, idx) => {
                  const name = svc.custom_name || svc.global_service.name;
                  const desc = svc.custom_description || svc.global_service.description;
                  const price = minPrice(svc);
                  const duration = svc.pricing[0]?.duration_min || svc.global_service.base_duration_min;
                  const hasVariants = svc.pricing.length > 1;

                  return (
                    <div
                      key={svc.id}
                      className="group p-5 rounded-2xl bg-card border border-border hover:shadow-luxe hover:border-primary/20 transition-all animate-slide-up"
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-semibold mb-1">{name}</h3>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-accent text-xs text-accent-foreground font-medium">
                            {svc.global_service.gender}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{desc}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1">
                            {hasVariants && <span className="text-xs text-muted-foreground">from</span>}
                            <span className="font-display text-xl font-bold text-primary">₹{price}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3" />
                            {duration} min
                          </div>
                        </div>
                        <Link
                          href={`/book?branch=${branch.slug}&service=${svc.id}`}
                          className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1"
                        >
                          Book <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stylists Tab */}
        {activeTab === 'stylists' && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">Meet Our Stylists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member, idx) => (
                <div
                  key={member.id}
                  className="p-6 rounded-2xl bg-card border border-border hover:shadow-luxe transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-display text-2xl font-bold text-primary/50">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.designation}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{member.bio}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-gold text-gold" />
                      <span className="text-sm font-semibold">{Number(member.rating).toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({member.review_count})</span>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-accent text-xs font-medium text-accent-foreground">
                      {member.skill_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review, idx) => (
                <div
                  key={review.id}
                  className="p-6 rounded-2xl bg-card border border-border animate-slide-up"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-foreground/80 leading-relaxed mb-4">"{review.comment}"</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="col-span-2 text-center py-16">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">About {branch.name}</h2>
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Location
                </h3>
                <p className="text-muted-foreground">{branch.address}</p>
                <p className="text-muted-foreground">{branch.locality}, {branch.city}</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Hours
                </h3>
                <p className="text-muted-foreground">Open daily {branch.opening_time} - {branch.closing_time}</p>
              </div>
              {branch.phone && (
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" /> Contact
                  </h3>
                  <p className="text-muted-foreground">{branch.phone}</p>
                </div>
              )}
              <Link
                href={`/book?branch=${branch.slug}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-luxe"
              >
                <Calendar className="w-5 h-5" />
                Book Appointment at {branch.name}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
