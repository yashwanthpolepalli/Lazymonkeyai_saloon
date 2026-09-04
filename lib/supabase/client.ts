import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type UserRole = 'customer' | 'owner' | 'staff' | 'super_admin';

export interface DatabaseBranch {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  locality: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  opening_time: string;
  closing_time: string;
  rating: number;
  review_count: number;
  status: string;
  image_url: string | null;
}

export interface DatabaseServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  gender_filter: string | null;
}

export interface DatabaseGlobalService {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  base_duration_min: number;
  required_skill_level: string;
  gender: string;
  status: string;
}

export interface DatabaseSalonService {
  id: string;
  organization_id: string;
  branch_id: string;
  global_service_id: string;
  custom_name: string | null;
  custom_description: string | null;
  status: string;
}

export interface DatabaseServicePricing {
  id: string;
  salon_service_id: string;
  branch_id: string;
  gender: string | null;
  hair_length: string | null;
  stylist_level: string | null;
  price: number;
  duration_min: number;
}

export interface DatabaseStaff {
  id: string;
  organization_id: string;
  branch_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  designation: string;
  skill_level: string;
  bio: string;
  avatar_url: string | null;
  rating: number;
  review_count: number;
  status: string;
}

export interface DatabaseMembership {
  id: string;
  organization_id: string;
  name: string;
  tier: string;
  hair_discount: number;
  skin_discount: number;
  product_discount: number;
  price: number;
  validity_days: number;
  benefits: string[] | null;
  status: string;
}

export interface DatabaseOffer {
  id: string;
  organization_id: string;
  branch_id: string | null;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  code: string;
  start_date: string;
  end_date: string;
  status: string;
  image_url: string | null;
}

export interface DatabasePackage {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  price: number;
  validity_days: number;
  status: string;
  image_url: string | null;
}

export interface DatabaseReview {
  id: string;
  branch_id: string;
  staff_id: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface DatabaseBooking {
  id: string;
  booking_number: string;
  customer_id: string | null;
  branch_id: string;
  salon_service_id: string;
  staff_id: string | null;
  service_date: string;
  start_time: string;
  end_time: string;
  status: string;
  base_price: number;
  discount: number;
  membership_discount: number;
  wallet_used: number;
  loyalty_used: number;
  final_price: number;
  payment_status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export interface DatabaseUserRole {
  id: string;
  user_id: string;
  role: UserRole;
  organization_id: string | null;
  branch_id: string | null;
}
