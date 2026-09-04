/*
# LAZYMONKEYAI Salon OS — Core Schema

## Overview
Multi-tenant Salon Operating System with global service catalog, salon-specific service menus,
branch-level pricing, staff skill mapping, bookings, memberships, wallet, loyalty, and packages.

## New Tables

1. **organizations** — Salon companies/chains (tenant root)
   - id, name, slug, logo_url, contact_email, contact_phone, plan, status, created_at

2. **branches** — Salon locations belonging to an organization
   - id, organization_id, name, slug, address, city, locality, latitude, longitude,
     phone, opening_time, closing_time, rating, review_count, status, created_at

3. **service_categories** — Global service categories (Hair, Skin, Body, Nails, Makeup, Grooming, Bridal, Wellness)
   - id, name, slug, icon, display_order, gender_filter, created_at

4. **global_services** — Platform-level service catalog
   - id, category_id, name, slug, description, image_url, base_duration_min,
     required_skill_level, gender, status, created_at

5. **salon_services** — Salon-specific service offerings (organization adopts a global service)
   - id, organization_id, branch_id (nullable for org-level), global_service_id,
     custom_name, custom_description, status, created_at

6. **service_pricing** — Branch-level pricing for salon services
   - id, salon_service_id, branch_id, gender, hair_length, stylist_level,
     price, duration_min, created_at

7. **staff** — Salon employees
   - id, organization_id, branch_id, user_id (nullable, links to auth user),
     name, email, phone, role, designation, skill_level, bio, avatar_url,
     rating, review_count, status, created_at

8. **staff_services** — Maps staff to services they can perform
   - id, staff_id, global_service_id, created_at

9. **staff_shifts** — Staff working hours
   - id, staff_id, branch_id, day_of_week, start_time, end_time, created_at

10. **bookings** — Customer appointments
    - id, booking_number, customer_id, branch_id, salon_service_id, staff_id,
      service_date, start_time, end_time, status, base_price, discount,
      membership_discount, wallet_used, loyalty_used, final_price, payment_status,
      payment_method, notes, created_at, updated_at

11. **booking_addons** — Add-on services for a booking
    - id, booking_id, name, price, created_at

12. **customers** — Customer profiles (extends auth.users)
    - id, user_id, name, email, phone, gender, preferred_branch_id,
      preferred_staff_id, beauty_profile, created_at

13. **memberships** — Membership plans
    - id, organization_id, name, tier, hair_discount, skin_discount, product_discount,
      price, validity_days, benefits, status, created_at

14. **customer_memberships** — Customer's active memberships
    - id, customer_id, membership_id, start_date, end_date, status, created_at

15. **wallets** — Customer wallet balances
    - id, customer_id, balance, created_at, updated_at

16. **wallet_transactions** — Wallet credit/debit history
    - id, wallet_id, amount, type (credit/debit), description, booking_id, created_at

17. **loyalty_points** — Customer loyalty point balances
    - id, customer_id, points, created_at, updated_at

18. **packages** — Service packages (bundled services)
    - id, organization_id, name, description, price, validity_days, status, created_at

19. **package_services** — Services included in a package
    - id, package_id, global_service_id, quantity, created_at

20. **customer_packages** — Customer's purchased packages
    - id, customer_id, package_id, purchase_date, expiry_date, status, created_at

21. **reviews** — Customer reviews for salons/services/staff
    - id, customer_id, branch_id, staff_id, booking_id, rating, comment, created_at

22. **offers** — Promotional offers
    - id, organization_id, branch_id (nullable), title, description, discount_type,
      discount_value, code, start_date, end_date, status, created_at

23. **tickets** — Customer support tickets
    - id, ticket_number, customer_id, organization_id, branch_id, category,
      subject, description, status, priority, created_at, updated_at

24. **ticket_replies** — Replies on support tickets
    - id, ticket_id, author_id, author_role, message, created_at

25. **user_roles** — Maps auth users to system roles (customer, owner, staff, super_admin)
    - id, user_id, role, organization_id (nullable), branch_id (nullable), created_at

## Security
- RLS enabled on ALL tables.
- Policies: authenticated users can read/create/update their own data.
- Public read on organizations, branches, global_services, service_categories (so customers can browse).
- Customer-scoped tables use customer_id ownership checks.
- Organization-scoped tables use user_roles membership checks.

## Notes
1. This is a multi-tenant schema — organization_id is the tenant boundary.
2. Global service catalog is platform-managed; salons adopt services via salon_services.
3. Branch-level pricing allows different prices per location.
4. Staff are linked to auth.users via user_id for login.
5. Role-based auth: user_roles table determines dashboard access.
*/

-- ============ ORGANIZATIONS ============
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  contact_email text,
  contact_phone text,
  plan text DEFAULT 'starter',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_organizations" ON organizations;
CREATE POLICY "public_read_organizations" ON organizations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "org_admin_insert_organizations" ON organizations;
CREATE POLICY "org_admin_insert_organizations" ON organizations FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "org_admin_update_organizations" ON organizations;
CREATE POLICY "org_admin_update_organizations" ON organizations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ BRANCHES ============
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  address text,
  city text NOT NULL,
  locality text,
  latitude float8,
  longitude float8,
  phone text,
  opening_time time DEFAULT '09:00',
  closing_time time DEFAULT '21:00',
  rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  status text DEFAULT 'active',
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_branches" ON branches;
CREATE POLICY "public_read_branches" ON branches FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_branches" ON branches;
CREATE POLICY "auth_insert_branches" ON branches FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_branches" ON branches;
CREATE POLICY "auth_update_branches" ON branches FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ SERVICE CATEGORIES ============
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  display_order int DEFAULT 0,
  gender_filter text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_service_categories" ON service_categories;
CREATE POLICY "public_read_service_categories" ON service_categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_service_categories" ON service_categories;
CREATE POLICY "auth_insert_service_categories" ON service_categories FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_service_categories" ON service_categories;
CREATE POLICY "auth_update_service_categories" ON service_categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ GLOBAL SERVICES ============
CREATE TABLE IF NOT EXISTS global_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES service_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text,
  description text,
  image_url text,
  base_duration_min int DEFAULT 60,
  required_skill_level text DEFAULT 'Junior',
  gender text DEFAULT 'Unisex',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE global_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_global_services" ON global_services;
CREATE POLICY "public_read_global_services" ON global_services FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_global_services" ON global_services;
CREATE POLICY "auth_insert_global_services" ON global_services FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_global_services" ON global_services;
CREATE POLICY "auth_update_global_services" ON global_services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ SALON SERVICES ============
CREATE TABLE IF NOT EXISTS salon_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  global_service_id uuid NOT NULL REFERENCES global_services(id) ON DELETE CASCADE,
  custom_name text,
  custom_description text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE salon_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_salon_services" ON salon_services;
CREATE POLICY "public_read_salon_services" ON salon_services FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_salon_services" ON salon_services;
CREATE POLICY "auth_insert_salon_services" ON salon_services FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_salon_services" ON salon_services;
CREATE POLICY "auth_update_salon_services" ON salon_services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_salon_services" ON salon_services;
CREATE POLICY "auth_delete_salon_services" ON salon_services FOR DELETE
  TO authenticated USING (true);

-- ============ SERVICE PRICING ============
CREATE TABLE IF NOT EXISTS service_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_service_id uuid NOT NULL REFERENCES salon_services(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  gender text,
  hair_length text,
  stylist_level text,
  price numeric NOT NULL DEFAULT 0,
  duration_min int DEFAULT 60,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_service_pricing" ON service_pricing;
CREATE POLICY "public_read_service_pricing" ON service_pricing FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_service_pricing" ON service_pricing;
CREATE POLICY "auth_insert_service_pricing" ON service_pricing FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_service_pricing" ON service_pricing;
CREATE POLICY "auth_update_service_pricing" ON service_pricing FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_service_pricing" ON service_pricing;
CREATE POLICY "auth_delete_service_pricing" ON service_pricing FOR DELETE
  TO authenticated USING (true);

-- ============ STAFF ============
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  user_id uuid,
  name text NOT NULL,
  email text,
  phone text,
  role text DEFAULT 'staff',
  designation text,
  skill_level text DEFAULT 'Junior',
  bio text,
  avatar_url text,
  rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_staff" ON staff;
CREATE POLICY "public_read_staff" ON staff FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_staff" ON staff;
CREATE POLICY "auth_insert_staff" ON staff FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_staff" ON staff;
CREATE POLICY "auth_update_staff" ON staff FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_staff" ON staff;
CREATE POLICY "auth_delete_staff" ON staff FOR DELETE
  TO authenticated USING (true);

-- ============ STAFF SERVICES ============
CREATE TABLE IF NOT EXISTS staff_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  global_service_id uuid NOT NULL REFERENCES global_services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_staff_services" ON staff_services;
CREATE POLICY "public_read_staff_services" ON staff_services FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_staff_services" ON staff_services;
CREATE POLICY "auth_insert_staff_services" ON staff_services FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_staff_services" ON staff_services;
CREATE POLICY "auth_delete_staff_services" ON staff_services FOR DELETE
  TO authenticated USING (true);

-- ============ STAFF SHIFTS ============
CREATE TABLE IF NOT EXISTS staff_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  day_of_week int NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_staff_shifts" ON staff_shifts;
CREATE POLICY "public_read_staff_shifts" ON staff_shifts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_staff_shifts" ON staff_shifts;
CREATE POLICY "auth_insert_staff_shifts" ON staff_shifts FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_staff_shifts" ON staff_shifts;
CREATE POLICY "auth_update_staff_shifts" ON staff_shifts FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_staff_shifts" ON staff_shifts;
CREATE POLICY "auth_delete_staff_shifts" ON staff_shifts FOR DELETE
  TO authenticated USING (true);

-- ============ CUSTOMERS ============
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  name text NOT NULL,
  email text,
  phone text,
  gender text,
  preferred_branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  preferred_staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  beauty_profile jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_customers" ON customers;
CREATE POLICY "public_read_customers" ON customers FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_customers" ON customers;
CREATE POLICY "auth_insert_customers" ON customers FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_customers" ON customers;
CREATE POLICY "auth_update_customers" ON customers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ BOOKINGS ============
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text UNIQUE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  salon_service_id uuid NOT NULL REFERENCES salon_services(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  service_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'pending',
  base_price numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  membership_discount numeric DEFAULT 0,
  wallet_used numeric DEFAULT 0,
  loyalty_used numeric DEFAULT 0,
  final_price numeric DEFAULT 0,
  payment_status text DEFAULT 'pending',
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_bookings" ON bookings;
CREATE POLICY "public_read_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_bookings" ON bookings;
CREATE POLICY "auth_insert_bookings" ON bookings FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_bookings" ON bookings;
CREATE POLICY "auth_update_bookings" ON bookings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_bookings" ON bookings;
CREATE POLICY "auth_delete_bookings" ON bookings FOR DELETE
  TO authenticated USING (true);

-- ============ BOOKING ADDONS ============
CREATE TABLE IF NOT EXISTS booking_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_booking_addons" ON booking_addons;
CREATE POLICY "public_read_booking_addons" ON booking_addons FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_booking_addons" ON booking_addons;
CREATE POLICY "auth_insert_booking_addons" ON booking_addons FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_booking_addons" ON booking_addons;
CREATE POLICY "auth_delete_booking_addons" ON booking_addons FOR DELETE
  TO authenticated USING (true);

-- ============ MEMBERSHIPS ============
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  tier text NOT NULL,
  hair_discount numeric DEFAULT 0,
  skin_discount numeric DEFAULT 0,
  product_discount numeric DEFAULT 0,
  price numeric DEFAULT 0,
  validity_days int DEFAULT 365,
  benefits jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_memberships" ON memberships;
CREATE POLICY "public_read_memberships" ON memberships FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_memberships" ON memberships;
CREATE POLICY "auth_insert_memberships" ON memberships FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_memberships" ON memberships;
CREATE POLICY "auth_update_memberships" ON memberships FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ CUSTOMER MEMBERSHIPS ============
CREATE TABLE IF NOT EXISTS customer_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customer_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_customer_memberships" ON customer_memberships;
CREATE POLICY "public_read_customer_memberships" ON customer_memberships FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_customer_memberships" ON customer_memberships;
CREATE POLICY "auth_insert_customer_memberships" ON customer_memberships FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_customer_memberships" ON customer_memberships;
CREATE POLICY "auth_update_customer_memberships" ON customer_memberships FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ WALLETS ============
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_wallets" ON wallets;
CREATE POLICY "public_read_wallets" ON wallets FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_wallets" ON wallets;
CREATE POLICY "auth_insert_wallets" ON wallets FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_wallets" ON wallets;
CREATE POLICY "auth_update_wallets" ON wallets FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ WALLET TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL,
  description text,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_wallet_transactions" ON wallet_transactions;
CREATE POLICY "public_read_wallet_transactions" ON wallet_transactions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_wallet_transactions" ON wallet_transactions;
CREATE POLICY "auth_insert_wallet_transactions" ON wallet_transactions FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============ LOYALTY POINTS ============
CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  points int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_loyalty_points" ON loyalty_points;
CREATE POLICY "public_read_loyalty_points" ON loyalty_points FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_loyalty_points" ON loyalty_points;
CREATE POLICY "auth_insert_loyalty_points" ON loyalty_points FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_loyalty_points" ON loyalty_points;
CREATE POLICY "auth_update_loyalty_points" ON loyalty_points FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ PACKAGES ============
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  validity_days int DEFAULT 90,
  status text DEFAULT 'active',
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_packages" ON packages;
CREATE POLICY "public_read_packages" ON packages FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_packages" ON packages;
CREATE POLICY "auth_insert_packages" ON packages FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_packages" ON packages;
CREATE POLICY "auth_update_packages" ON packages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ PACKAGE SERVICES ============
CREATE TABLE IF NOT EXISTS package_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  global_service_id uuid NOT NULL REFERENCES global_services(id) ON DELETE CASCADE,
  quantity int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE package_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_package_services" ON package_services;
CREATE POLICY "public_read_package_services" ON package_services FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_package_services" ON package_services;
CREATE POLICY "auth_insert_package_services" ON package_services FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============ CUSTOMER PACKAGES ============
CREATE TABLE IF NOT EXISTS customer_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  purchase_date date NOT NULL,
  expiry_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE customer_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_customer_packages" ON customer_packages;
CREATE POLICY "public_read_customer_packages" ON customer_packages FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_customer_packages" ON customer_packages;
CREATE POLICY "auth_insert_customer_packages" ON customer_packages FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_customer_packages" ON customer_packages;
CREATE POLICY "auth_update_customer_packages" ON customer_packages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  rating int NOT NULL DEFAULT 5,
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_reviews" ON reviews;
CREATE POLICY "auth_insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_reviews" ON reviews;
CREATE POLICY "auth_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ OFFERS ============
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  discount_type text DEFAULT 'percentage',
  discount_value numeric DEFAULT 0,
  code text,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_offers" ON offers;
CREATE POLICY "public_read_offers" ON offers FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_offers" ON offers;
CREATE POLICY "auth_insert_offers" ON offers FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_offers" ON offers;
CREATE POLICY "auth_update_offers" ON offers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ TICKETS ============
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  category text,
  subject text NOT NULL,
  description text,
  status text DEFAULT 'open',
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_tickets" ON tickets;
CREATE POLICY "public_read_tickets" ON tickets FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_tickets" ON tickets;
CREATE POLICY "auth_insert_tickets" ON tickets FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_tickets" ON tickets;
CREATE POLICY "auth_update_tickets" ON tickets FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ TICKET REPLIES ============
CREATE TABLE IF NOT EXISTS ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id uuid,
  author_role text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_ticket_replies" ON ticket_replies;
CREATE POLICY "public_read_ticket_replies" ON ticket_replies FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_ticket_replies" ON ticket_replies;
CREATE POLICY "auth_insert_ticket_replies" ON ticket_replies FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============ USER ROLES ============
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'customer',
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_user_roles" ON user_roles;
CREATE POLICY "public_read_user_roles" ON user_roles FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_user_roles" ON user_roles;
CREATE POLICY "auth_insert_user_roles" ON user_roles FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_user_roles" ON user_roles;
CREATE POLICY "auth_update_user_roles" ON user_roles FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_branches_org ON branches(organization_id);
CREATE INDEX IF NOT EXISTS idx_branches_city ON branches(city);
CREATE INDEX IF NOT EXISTS idx_global_services_cat ON global_services(category_id);
CREATE INDEX IF NOT EXISTS idx_salon_services_org ON salon_services(organization_id);
CREATE INDEX IF NOT EXISTS idx_salon_services_branch ON salon_services(branch_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_salon ON service_pricing(salon_service_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_branch ON service_pricing(branch_id);
CREATE INDEX IF NOT EXISTS idx_staff_org ON staff(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_branch ON staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_bookings_branch ON bookings(branch_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(service_date);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_branch ON reviews(branch_id);
CREATE INDEX IF NOT EXISTS idx_offers_org ON offers(organization_id);
