'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { DatabaseBranch, DatabaseStaff, DatabaseSalonService, DatabaseGlobalService, DatabaseServicePricing } from '@/lib/supabase/client';
import {
  ChevronLeft, Star, Clock, MapPin, Calendar, Check, ArrowRight, ArrowLeft,
  User, Sparkles, CreditCard, Wallet, Tag, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

type Step = 'branch' | 'service' | 'stylist' | 'datetime' | 'payment' | 'confirmation';

interface BookingData {
  branch: DatabaseBranch | null;
  service: DatabaseSalonService & { global_service: DatabaseGlobalService } | null;
  pricing: DatabaseServicePricing | null;
  staff: DatabaseStaff | null;
  date: string | null;
  time: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
}

const steps: { key: Step; label: string }[] = [
  { key: 'branch', label: 'Salon' },
  { key: 'service', label: 'Service' },
  { key: 'stylist', label: 'Stylist' },
  { key: 'datetime', label: 'Date & Time' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirmation', label: 'Done' },
];

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>('branch');
  const [branches, setBranches] = useState<DatabaseBranch[]>([]);
  const [services, setServices] = useState<(DatabaseSalonService & { global_service: DatabaseGlobalService })[]>([]);
  const [pricing, setPricing] = useState<DatabaseServicePricing[]>([]);
  const [staff, setStaff] = useState<DatabaseStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState<BookingData>({
    branch: null,
    service: null,
    pricing: null,
    staff: null,
    date: null,
    time: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    paymentMethod: 'pay_at_salon',
  });

  useEffect(() => {
    (async () => {
      const branchSlug = searchParams.get('branch');
      const { data: branchData } = await supabase.from('branches').select('*').eq('status', 'active').order('rating', { ascending: false });
      setBranches(branchData as DatabaseBranch[] || []);

      if (branchSlug) {
        const selectedBranch = (branchData as DatabaseBranch[])?.find(b => b.slug === branchSlug);
        if (selectedBranch) {
          setData(d => ({ ...d, branch: selectedBranch }));
          await loadBranchData(selectedBranch.id);
          setStep('service');
        }
      }
      setLoading(false);
    })();
  }, [searchParams]);

  const loadBranchData = async (branchId: string) => {
    const [servicesRes, pricingRes, staffRes] = await Promise.all([
      supabase.from('salon_services').select('*, global_service:global_services(*)').eq('branch_id', branchId).eq('status', 'active'),
      supabase.from('service_pricing').select('*').eq('branch_id', branchId),
      supabase.from('staff').select('*').eq('branch_id', branchId).eq('status', 'active'),
    ]);
    setServices((servicesRes.data as any[]) || []);
    setPricing((pricingRes.data as DatabaseServicePricing[]) || []);
    setStaff((staffRes.data as DatabaseStaff[]) || []);
  };

  const handleSelectBranch = async (branch: DatabaseBranch) => {
    setData(d => ({ ...d, branch, service: null, pricing: null, staff: null }));
    await loadBranchData(branch.id);
    setStep('service');
  };

  const handleSelectService = (service: any) => {
    setData(d => ({ ...d, service, pricing: null }));
    const servicePricing = pricing.filter(p => p.salon_service_id === service.id);
    if (servicePricing.length === 1) {
      setData(d => ({ ...d, pricing: servicePricing[0] }));
    }
  };

  const handleSelectPricing = (p: DatabaseServicePricing) => {
    setData(d => ({ ...d, pricing: p }));
  };

  const handleSelectStaff = (s: DatabaseStaff | null) => {
    setData(d => ({ ...d, staff: s }));
    setStep('datetime');
  };

  const generateTimeSlots = () => {
    if (!data.branch) return [];
    const slots: string[] = [];
    const open = parseInt(data.branch.opening_time.split(':')[0]);
    const close = parseInt(data.branch.closing_time.split(':')[0]);
    for (let h = open; h < close; h++) {
      slots.push(`${h}:00`);
      slots.push(`${h}:30`);
    }
    return slots;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getNext7Days = () => {
    const days: { date: string; label: string; dayName: string; dayNum: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayName: d.toLocaleDateString('en-IN', { weekday: 'long' }),
        dayNum: d.getDate().toString(),
      });
    }
    return days;
  };

  const handleConfirmBooking = async () => {
    if (!data.branch || !data.service || !data.pricing || !data.date || !data.time) {
      toast.error('Please complete all booking details');
      return;
    }
    if (!data.customerName || !data.customerEmail || !data.customerPhone) {
      toast.error('Please fill in your details');
      return;
    }

    setSubmitting(true);
    try {
      const bookingNumber = `APT-${Date.now().toString().slice(-6)}`;
      const endTime = new Date(`2000-01-01T${data.time}`);
      endTime.setMinutes(endTime.getMinutes() + data.pricing.duration_min);
      const endTimeStr = endTime.toTimeString().slice(0, 5);

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', data.customerEmail)
        .maybeSingle();

      let customerId = customer?.id;

      if (!customerId) {
        const { data: newCustomer } = await supabase.from('customers').insert({
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        }).select().single();
        customerId = newCustomer?.id;
      }

      const { error } = await supabase.from('bookings').insert({
        booking_number: bookingNumber,
        customer_id: customerId,
        branch_id: data.branch.id,
        salon_service_id: data.service.id,
        staff_id: data.staff?.id || null,
        service_date: data.date,
        start_time: data.time,
        end_time: endTimeStr,
        status: 'confirmed',
        base_price: data.pricing.price,
        final_price: data.pricing.price,
        payment_status: data.paymentMethod === 'pay_at_salon' ? 'pending' : 'paid',
        payment_method: data.paymentMethod,
      });

      if (error) throw error;

      setData(d => ({ ...d }));
      setStep('confirmation');
      toast.success('Appointment confirmed!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const canGoBack = currentStepIndex > 0 && step !== 'confirmation';

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      {/* Header */}
      <div className="border-b border-border bg-secondary/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">Book Appointment</h1>

          {/* Progress Steps */}
          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-1">
            {steps.map((s, idx) => (
              <div key={s.key} className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  idx === currentStepIndex
                    ? 'bg-primary text-primary-foreground'
                    : idx < currentStepIndex
                    ? 'bg-success/15 text-success'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {idx < currentStepIndex ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 text-[10px]">{idx + 1}</span>
                  )}
                  {s.label}
                </div>
                {idx < steps.length - 1 && <div className="w-4 md:w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step: Branch */}
        {step === 'branch' && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Choose a Salon Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((branch, idx) => (
                <button
                  key={branch.id}
                  onClick={() => handleSelectBranch(branch)}
                  className="group p-5 rounded-2xl bg-card border-2 border-border hover:border-primary text-left transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold group-hover:text-primary">{branch.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-gold text-gold" />
                      <span className="text-sm font-semibold">{Number(branch.rating).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {branch.locality}, {branch.city}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {branch.opening_time} - {branch.closing_time}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Service */}
        {step === 'service' && data.branch && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Choose a Service</h2>
              <button onClick={() => setStep('branch')} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Change salon
              </button>
            </div>
            <div className="space-y-3">
              {services.map((svc, idx) => {
                const name = svc.custom_name || svc.global_service.name;
                const desc = svc.custom_description || svc.global_service.description;
                const svcPricing = pricing.filter(p => p.salon_service_id === svc.id);
                const isSelected = data.service?.id === svc.id;
                const minPrice = svcPricing.length > 0 ? Math.min(...svcPricing.map(p => p.price)) : 0;

                return (
                  <div key={svc.id}>
                    <button
                      onClick={() => handleSelectService(svc)}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                        isSelected ? 'border-primary bg-accent' : 'border-border bg-card hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-semibold mb-1">{name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{desc}</p>
                          <div className="flex items-center gap-3">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-accent text-xs text-accent-foreground font-medium">
                              {svc.global_service.gender}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {svcPricing[0]?.duration_min || svc.global_service.base_duration_min} min
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-xl font-bold text-primary">
                            {svcPricing.length > 1 ? `from ₹${minPrice}` : `₹${minPrice}`}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Pricing variants */}
                    {isSelected && svcPricing.length > 1 && (
                      <div className="mt-2 ml-4 p-4 rounded-xl bg-secondary/50 space-y-2 animate-fade-in">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Select option:</p>
                        {svcPricing.map(p => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectPricing(p)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              data.pricing?.id === p.id
                                ? 'border-primary bg-accent'
                                : 'border-border bg-background hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {data.pricing?.id === p.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                              <div>
                                <span className="text-sm font-medium">
                                  {p.hair_length ? `${p.hair_length} · ` : ''}
                                  {p.stylist_level}
                                </span>
                                {p.gender && (
                                  <span className="text-xs text-muted-foreground ml-2">{p.gender}</span>
                                )}
                              </div>
                            </div>
                            <span className="font-semibold text-primary">₹{p.price}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {data.service && (data.pricing || pricing.filter(p => p.salon_service_id === data.service.id).length <= 1) && (
              <button
                onClick={() => setStep('stylist')}
                className="mt-6 w-full md:w-auto px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-luxe flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Step: Stylist */}
        {step === 'stylist' && data.branch && data.service && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Choose Your Stylist</h2>
              <button onClick={() => setStep('service')} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Change service
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSelectStaff(null)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                  data.staff === null ? 'border-primary bg-accent' : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Any Available Stylist</h3>
                  <p className="text-sm text-muted-foreground">We'll assign the best available stylist for you</p>
                </div>
                {data.staff === null && <CheckCircle2 className="w-5 h-5 text-primary" />}
              </button>

              {staff.map((member, idx) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectStaff(member)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                    data.staff?.id === member.id ? 'border-primary bg-accent' : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-display text-lg font-bold text-primary/50">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.designation}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-gold text-gold" />
                    <span className="text-sm font-semibold">{Number(member.rating).toFixed(1)}</span>
                  </div>
                  {data.staff?.id === member.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: DateTime */}
        {step === 'datetime' && data.branch && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Select Date & Time</h2>
              <button onClick={() => setStep('stylist')} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Change stylist
              </button>
            </div>

            {/* Date Selection */}
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Choose a date</h3>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-8">
              {getNext7Days().map((day) => (
                <button
                  key={day.date}
                  onClick={() => setData(d => ({ ...d, date: day.date, time: null }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    data.date === day.date
                      ? 'border-primary bg-accent'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <div className="text-xs text-muted-foreground">{day.label}</div>
                  <div className="font-display text-xl font-bold mt-1">{day.dayNum}</div>
                </button>
              ))}
            </div>

            {/* Time Selection */}
            {data.date && (
              <>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Available time slots</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {generateTimeSlots().map((slot, idx) => {
                    const isOdd = idx % 3 === 0;
                    return (
                      <button
                        key={slot}
                        onClick={() => setData(d => ({ ...d, time: slot }))}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          data.time === slot
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isOdd
                            ? 'border-border bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                            : 'border-border bg-card hover:border-primary/30'
                        }`}
                        disabled={isOdd}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {data.date && data.time && (
              <button
                onClick={() => setStep('payment')}
                className="mt-6 w-full md:w-auto px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-luxe flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Step: Payment */}
        {step === 'payment' && data.branch && data.service && data.pricing && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">Your Details & Payment</h2>
              <button onClick={() => setStep('datetime')} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Change date
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Details */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-card border border-border">
                  <h3 className="font-semibold mb-4">Your Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Full Name</label>
                      <input
                        type="text"
                        value={data.customerName}
                        onChange={(e) => setData(d => ({ ...d, customerName: e.target.value }))}
                        placeholder="Enter your name"
                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Email</label>
                      <input
                        type="email"
                        value={data.customerEmail}
                        onChange={(e) => setData(d => ({ ...d, customerEmail: e.target.value }))}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-1 block">Phone</label>
                      <input
                        type="tel"
                        value={data.customerPhone}
                        onChange={(e) => setData(d => ({ ...d, customerPhone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-card border border-border">
                  <h3 className="font-semibold mb-4">Payment Method</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'pay_at_salon', label: 'Pay at Salon', icon: CreditCard, desc: 'Pay after your service' },
                      { key: 'upi', label: 'UPI', icon: Wallet, desc: 'Pay via UPI' },
                      { key: 'card', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Pay with card' },
                    ].map(method => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.key}
                          onClick={() => setData(d => ({ ...d, paymentMethod: method.key }))}
                          className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            data.paymentMethod === method.key
                              ? 'border-primary bg-accent'
                              : 'border-border bg-background hover:border-primary/30'
                          }`}
                        >
                          <Icon className="w-5 h-5 text-primary" />
                          <div className="text-left flex-1">
                            <p className="text-sm font-medium">{method.label}</p>
                            <p className="text-xs text-muted-foreground">{method.desc}</p>
                          </div>
                          {data.paymentMethod === method.key && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <div className="p-5 rounded-2xl bg-card border border-border sticky top-24">
                  <h3 className="font-semibold mb-4">Booking Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salon</span>
                      <span className="font-medium">{data.branch.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium">{data.service.custom_name || data.service.global_service.name}</span>
                    </div>
                    {data.pricing.hair_length && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hair Length</span>
                        <span className="font-medium">{data.pricing.hair_length}</span>
                      </div>
                    )}
                    {data.pricing.stylist_level && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stylist Level</span>
                        <span className="font-medium">{data.pricing.stylist_level}</span>
                      </div>
                    )}
                    {data.staff && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stylist</span>
                        <span className="font-medium">{data.staff.name}</span>
                      </div>
                    )}
                    {data.date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{formatDate(data.date)}</span>
                      </div>
                    )}
                    {data.time && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">{data.time}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{data.pricing.duration_min} min</span>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold">Total</span>
                        <span className="font-display text-2xl font-bold text-primary">₹{data.pricing.price}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={submitting || !data.customerName || !data.customerEmail || !data.customerPhone}
                    className="mt-6 w-full py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-luxe disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>Confirm Booking <Check className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Confirmation */}
        {step === 'confirmation' && data.branch && data.service && data.pricing && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-2">Appointment Confirmed!</h2>
            <p className="text-muted-foreground mb-8">We've sent a confirmation to your email and phone.</p>

            <div className="p-6 rounded-2xl bg-card border border-border text-left mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salon</span>
                  <span className="font-medium">{data.branch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium">{data.service.custom_name || data.service.global_service.name}</span>
                </div>
                {data.staff && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stylist</span>
                    <span className="font-medium">{data.staff.name}</span>
                  </div>
                )}
                {data.date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(data.date)}</span>
                  </div>
                )}
                {data.time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{data.time}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{data.pricing.duration_min} min</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="font-semibold">Total</span>
                  <span className="font-display text-xl font-bold text-primary">₹{data.pricing.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium capitalize">{data.paymentMethod === 'pay_at_salon' ? 'Pay at Salon' : data.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
              >
                Back to Home
              </Link>
              <Link
                href="/salons"
                className="px-6 py-3 rounded-full border border-border font-semibold hover:bg-secondary transition-all"
              >
                Explore More Salons
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-20"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <BookingContent />
    </Suspense>
  );
}
