'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { DatabaseBranch } from '@/lib/supabase/client';
import { Star, MapPin, Clock, ArrowRight, Search, Scissors } from 'lucide-react';

const salonImages = [
  'https://images.pexels.com/photos/7750114/pexels-photo-7750114.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7195803/pexels-photo-7195803.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7195800/pexels-photo-7195800.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7195809/pexels-photo-7195809.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export default function SalonsPage() {
  const [branches, setBranches] = useState<DatabaseBranch[]>([]);
  const [filtered, setFiltered] = useState<DatabaseBranch[]>([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('branches').select('*').eq('status', 'active').order('rating', { ascending: false });
      setBranches(data as DatabaseBranch[] || []);
      setFiltered(data as DatabaseBranch[] || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    let result = branches;
    if (city !== 'all') result = result.filter(b => b.city.toLowerCase() === city);
    if (search) result = result.filter(b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.locality?.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, city, branches]);

  const cities = [...new Set(branches.map(b => b.city))];

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      {/* Header */}
      <div className="bg-secondary/30 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Find Your Salon</h1>
          <p className="text-muted-foreground text-lg">Discover premium salons near you and book your next appointment.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="sticky top-16 md:top-20 z-30 bg-background/90 backdrop-blur-lg border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, locality, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
          >
            <option value="all">All Cities</option>
            {cities.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Salons Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No salons found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((branch, idx) => (
              <Link
                key={branch.id}
                href={`/salons/${branch.slug}`}
                className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-luxe-lg transition-all animate-scale-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={salonImages[idx % salonImages.length]}
                    alt={branch.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full glass-strong text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    {Number(branch.rating).toFixed(1)}
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full glass-strong text-xs font-medium">
                    {branch.locality}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{branch.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {branch.address}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {branch.opening_time} - {branch.closing_time}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-primary font-semibold group-hover:gap-2 transition-all">
                      View <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
