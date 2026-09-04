/*
# Seed Initial Data — Salon OS

## Overview
Populates the database with:
1. Service categories (Hair, Skin, Body, Nails, Makeup, Grooming, Bridal, Wellness)
2. Global service catalog (15+ services across categories)
3. Demo organization: "Luxe Salon" with 4 branches
4. Branch-level salon services with pricing
5. Staff members with skill mappings
6. Membership plans
7. Sample offers

This gives the app real data to display on first load.
*/

-- ============ SERVICE CATEGORIES ============
INSERT INTO service_categories (name, slug, icon, display_order, gender_filter) VALUES
  ('Hair', 'hair', 'Scissors', 1, NULL),
  ('Skin', 'skin', 'Sparkles', 2, NULL),
  ('Body', 'body', 'Heart', 3, NULL),
  ('Nails', 'nails', 'Hand', 4, NULL),
  ('Makeup', 'makeup', 'Palette', 5, 'Women'),
  ('Grooming', 'grooming', 'User', 6, 'Men'),
  ('Bridal', 'bridal', 'Crown', 7, 'Women'),
  ('Wellness', 'wellness', 'Flower2', 8, NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============ GLOBAL SERVICES ============
INSERT INTO global_services (category_id, name, slug, description, image_url, base_duration_min, required_skill_level, gender, status) VALUES
  ((SELECT id FROM service_categories WHERE slug='hair'), 'Haircut', 'haircut', 'Precision cut tailored to your face shape and style preference.', NULL, 45, 'Junior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='hair'), 'Hair Spa', 'hair-spa', 'Deep conditioning and scalp nourishment treatment for healthy, hydrated hair.', NULL, 90, 'Senior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='hair'), 'Keratin Treatment', 'keratin-treatment', 'Professional keratin smoothing treatment for frizz-free, manageable hair.', NULL, 150, 'Senior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='hair'), 'Hair Coloring', 'hair-coloring', 'Full hair coloring with premium quality color for vibrant, long-lasting results.', NULL, 120, 'Senior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='hair'), 'Hair Wash', 'hair-wash', 'Gentle cleansing wash with scalp massage.', NULL, 20, 'Junior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='skin'), 'Classic Facial', 'classic-facial', 'Relaxing facial cleanse with steam, exfoliation, and mask.', NULL, 60, 'Junior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='skin'), 'Hydra Facial', 'hydra-facial', 'Advanced hydradermabrasion treatment for deep skin hydration and glow.', NULL, 75, 'Senior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='skin'), 'Glow Facial', 'glow-facial', 'Premium facial with vitamin C infusion for instant radiance.', NULL, 60, 'Senior', 'Women', 'active'),
  ((SELECT id FROM service_categories WHERE slug='body'), 'Body Massage', 'body-massage', 'Full body relaxation massage with aromatic oils.', NULL, 60, 'Junior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='body'), 'Body Polishing', 'body-polishing', 'Full body exfoliation and polishing for smooth, glowing skin.', NULL, 75, 'Senior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='nails'), 'Manicure', 'manicure', 'Nail shaping, cuticle care, and hand massage with polish.', NULL, 45, 'Junior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='nails'), 'Pedicure', 'pedicure', 'Foot soak, scrub, nail care, and relaxing leg massage.', NULL, 50, 'Junior', 'Unisex', 'active'),
  ((SELECT id FROM service_categories WHERE slug='makeup'), 'Party Makeup', 'party-makeup', 'Full party makeup with premium products for a stunning look.', NULL, 60, 'Senior', 'Women', 'active'),
  ((SELECT id FROM service_categories WHERE slug='makeup'), 'Bridal Makeup', 'bridal-makeup', 'Complete bridal makeup package with trial session and touch-up kit.', NULL, 120, 'Master', 'Women', 'active'),
  ((SELECT id FROM service_categories WHERE slug='grooming'), 'Beard Styling', 'beard-styling', 'Professional beard trim and styling with hot towel finish.', NULL, 30, 'Junior', 'Men', 'active'),
  ((SELECT id FROM service_categories WHERE slug='grooming'), 'Clean Shave', 'clean-shave', 'Classic clean shave with hot towel and aftershave treatment.', NULL, 25, 'Junior', 'Men', 'active'),
  ((SELECT id FROM service_categories WHERE slug='wellness'), 'Head Massage', 'head-massage', 'Traditional Indian head massage for stress relief.', NULL, 30, 'Junior', 'Unisex', 'active')
ON CONFLICT DO NOTHING;

-- ============ ORGANIZATION ============
INSERT INTO organizations (name, slug, contact_email, contact_phone, plan, status) VALUES
  ('Luxe Salon', 'luxe-salon', 'contact@luxesalon.com', '+91 98765 43210', 'premium', 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============ BRANCHES ============
INSERT INTO branches (organization_id, name, slug, address, city, locality, phone, opening_time, closing_time, rating, review_count, status) VALUES
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Luxe Salon Jubilee Hills', 'luxe-jubilee-hills', 'Road No. 36, Jubilee Hills', 'Hyderabad', 'Jubilee Hills', '+91 98765 43211', '09:00', '21:00', 4.8, 326, 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Luxe Salon Banjara Hills', 'luxe-banjara-hills', 'Road No. 12, Banjara Hills', 'Hyderabad', 'Banjara Hills', '+91 98765 43212', '09:00', '21:00', 4.9, 412, 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Luxe Salon Gachibowli', 'luxe-gachibowli', 'IT Park Road, Gachibowli', 'Hyderabad', 'Gachibowli', '+91 98765 43213', '09:30', '20:30', 4.7, 198, 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Luxe Salon Madhapur', 'luxe-madhapur', 'Hi-Tech City Road, Madhapur', 'Hyderabad', 'Madhapur', '+91 98765 43214', '09:00', '21:00', 4.6, 156, 'active')
ON CONFLICT DO NOTHING;

-- ============ SALON SERVICES (org-level, available at all branches) ============
-- We'll create salon services per branch with different pricing

-- Helper: create salon services for each branch
-- Jubilee Hills branch
INSERT INTO salon_services (organization_id, branch_id, global_service_id, custom_name, custom_description, status)
SELECT (SELECT id FROM organizations WHERE slug='luxe-salon'),
       (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'),
       gs.id, NULL, NULL, 'active'
FROM global_services gs
WHERE gs.slug IN ('haircut','hair-spa','keratin-treatment','hair-coloring','classic-facial','hydra-facial','glow-facial','body-massage','manicure','pedicure','party-makeup','bridal-makeup','beard-styling','head-massage')
ON CONFLICT DO NOTHING;

-- Banjara Hills branch
INSERT INTO salon_services (organization_id, branch_id, global_service_id, custom_name, custom_description, status)
SELECT (SELECT id FROM organizations WHERE slug='luxe-salon'),
       (SELECT id FROM branches WHERE slug='luxe-banjara-hills'),
       gs.id, NULL, NULL, 'active'
FROM global_services gs
WHERE gs.slug IN ('haircut','hair-spa','keratin-treatment','hair-coloring','classic-facial','hydra-facial','glow-facial','body-massage','body-polishing','manicure','pedicure','party-makeup','bridal-makeup','beard-styling','clean-shave','head-massage')
ON CONFLICT DO NOTHING;

-- Gachibowli branch
INSERT INTO salon_services (organization_id, branch_id, global_service_id, custom_name, custom_description, status)
SELECT (SELECT id FROM organizations WHERE slug='luxe-salon'),
       (SELECT id FROM branches WHERE slug='luxe-gachibowli'),
       gs.id, NULL, NULL, 'active'
FROM global_services gs
WHERE gs.slug IN ('haircut','hair-spa','hair-coloring','classic-facial','hydra-facial','manicure','pedicure','beard-styling','head-massage')
ON CONFLICT DO NOTHING;

-- Madhapur branch
INSERT INTO salon_services (organization_id, branch_id, global_service_id, custom_name, custom_description, status)
SELECT (SELECT id FROM organizations WHERE slug='luxe-salon'),
       (SELECT id FROM branches WHERE slug='luxe-madhapur'),
       gs.id, NULL, NULL, 'active'
FROM global_services gs
WHERE gs.slug IN ('haircut','hair-spa','keratin-treatment','classic-facial','glow-facial','body-massage','manicure','pedicure','party-makeup','beard-styling','head-massage')
ON CONFLICT DO NOTHING;

-- ============ SERVICE PRICING ============
-- Jubilee Hills pricing
INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', NULL, 'Junior', 800, 45
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'haircut'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', NULL, 'Senior', 1800, 90
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'hair-spa'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', 'Short', 'Senior', 4999, 150
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'keratin-treatment'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', 'Medium', 'Senior', 5999, 150
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'keratin-treatment'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', 'Long', 'Senior', 6999, 150
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'keratin-treatment'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', NULL, 'Senior', 2500, 120
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'hair-coloring'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', NULL, 'Junior', 1200, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'classic-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', NULL, 'Senior', 2999, 75
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'hydra-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Women', NULL, 'Senior', 1999, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'glow-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', NULL, 'Junior', 1500, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'body-massage'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', NULL, 'Junior', 600, 45
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'manicure'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', NULL, 'Junior', 700, 50
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'pedicure'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Women', NULL, 'Senior', 3000, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'party-makeup'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Women', NULL, 'Master', 15000, 120
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'bridal-makeup'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Men', NULL, 'Junior', 300, 30
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'beard-styling'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Unisex', NULL, 'Junior', 500, 30
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-jubilee-hills') AND gs.slug = 'head-massage'
ON CONFLICT DO NOTHING;

-- Banjara Hills pricing (slightly higher — premium location)
INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Junior', 1000, 45
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'haircut'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Senior', 2000, 90
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'hair-spa'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', 'Short', 'Senior', 5999, 180
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'keratin-treatment'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', 'Medium', 'Senior', 6999, 180
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'keratin-treatment'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', 'Long', 'Senior', 7999, 180
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'keratin-treatment'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Senior', 3000, 120
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'hair-coloring'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Junior', 1500, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'classic-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Senior', 3499, 75
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'hydra-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Women', NULL, 'Senior', 2299, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'glow-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Junior', 1800, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'body-massage'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Senior', 3500, 75
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'body-polishing'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Junior', 700, 45
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'manicure'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Junior', 800, 50
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'pedicure'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Women', NULL, 'Senior', 3500, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'party-makeup'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Women', NULL, 'Master', 18000, 120
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'bridal-makeup'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Men', NULL, 'Junior', 400, 30
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'beard-styling'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Men', NULL, 'Junior', 350, 25
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'clean-shave'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Unisex', NULL, 'Junior', 600, 30
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-banjara-hills') AND gs.slug = 'head-massage'
ON CONFLICT DO NOTHING;

-- Gachibowli pricing (slightly lower)
INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Unisex', NULL, 'Junior', 600, 45
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-gachibowli') AND gs.slug = 'haircut'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Unisex', NULL, 'Senior', 1600, 75
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-gachibowli') AND gs.slug = 'hair-spa'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Unisex', NULL, 'Senior', 2200, 120
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-gachibowli') AND gs.slug = 'hair-coloring'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Unisex', NULL, 'Junior', 1000, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-gachibowli') AND gs.slug = 'classic-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Unisex', NULL, 'Senior', 2799, 75
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-gachibowli') AND gs.slug = 'hydra-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Unisex', NULL, 'Junior', 500, 45
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-gachibowli') AND gs.slug = 'manicure'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Unisex', NULL, 'Junior', 600, 50
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-gachibowli') AND gs.slug = 'pedicure'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Men', NULL, 'Junior', 250, 30
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-gachibowli') AND gs.slug = 'beard-styling'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Unisex', NULL, 'Junior', 400, 30
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-gachibowli') AND gs.slug = 'head-massage'
ON CONFLICT DO NOTHING;

-- Madhapur pricing
INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Unisex', NULL, 'Junior', 700, 45
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'haircut'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Unisex', NULL, 'Senior', 1700, 90
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'hair-spa'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Unisex', 'Short', 'Senior', 5499, 150
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'keratin-treatment'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Unisex', 'Medium', 'Senior', 6499, 150
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'keratin-treatment'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Unisex', NULL, 'Junior', 1100, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'classic-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Women', NULL, 'Senior', 1899, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'glow-facial'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Unisex', NULL, 'Junior', 1400, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'body-massage'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Unisex', NULL, 'Junior', 550, 45
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'manicure'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Unisex', NULL, 'Junior', 650, 50
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'pedicure'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Women', NULL, 'Senior', 2800, 60
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'party-makeup'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Men', NULL, 'Junior', 300, 30
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'beard-styling'
ON CONFLICT DO NOTHING;

INSERT INTO service_pricing (salon_service_id, branch_id, gender, hair_length, stylist_level, price, duration_min)
SELECT ss.id, (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Unisex', NULL, 'Junior', 450, 30
FROM salon_services ss
JOIN global_services gs ON ss.global_service_id = gs.id
WHERE ss.branch_id = (SELECT id FROM branches WHERE slug='luxe-madhapur') AND gs.slug = 'head-massage'
ON CONFLICT DO NOTHING;

-- ============ STAFF ============
INSERT INTO staff (organization_id, branch_id, name, email, phone, role, designation, skill_level, bio, rating, review_count, status) VALUES
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Priya Sharma', 'priya@luxesalon.com', '+91 90000 11111', 'staff', 'Senior Stylist', 'Senior', 'Specialist in hair treatments and styling with 8 years of experience.', 4.9, 234, 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Ananya Reddy', 'ananya@luxesalon.com', '+91 90000 22222', 'staff', 'Master Stylist', 'Master', 'Master stylist with expertise in bridal makeup and premium services.', 4.8, 189, 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), (SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 'Rahul Verma', 'rahul@luxesalon.com', '+91 90000 33333', 'staff', 'Hair Specialist', 'Senior', 'Hair specialist focusing on cuts, coloring, and keratin treatments.', 4.9, 156, 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Meera Iyer', 'meera@luxesalon.com', '+91 90000 44444', 'staff', 'Master Stylist', 'Master', 'Expert in skincare, facials, and bridal makeup.', 4.9, 201, 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), (SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 'Karthik Nair', 'karthik@luxesalon.com', '+91 90000 55555', 'staff', 'Senior Stylist', 'Senior', 'Grooming specialist with a passion for men''s styling.', 4.7, 132, 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Sneha Gupta', 'sneha@luxesalon.com', '+91 90000 66666', 'staff', 'Junior Stylist', 'Junior', 'Rising talent specializing in haircuts and basic skincare.', 4.6, 78, 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), (SELECT id FROM branches WHERE slug='luxe-madhapur'), 'Arjun Rao', 'arjun@luxesalon.com', '+91 90000 77777', 'staff', 'Senior Stylist', 'Senior', 'Experienced stylist with expertise in hair treatments and grooming.', 4.8, 112, 'active')
ON CONFLICT DO NOTHING;

-- ============ STAFF SERVICES MAPPING ============
-- Priya (Jubilee Hills) - Hair services
INSERT INTO staff_services (staff_id, global_service_id)
SELECT s.id, gs.id FROM staff s, global_services gs
WHERE s.name = 'Priya Sharma' AND gs.slug IN ('haircut','hair-spa','keratin-treatment','hair-coloring','head-massage')
ON CONFLICT DO NOTHING;

-- Ananya (Jubilee Hills) - Makeup & facials
INSERT INTO staff_services (staff_id, global_service_id)
SELECT s.id, gs.id FROM staff s, global_services gs
WHERE s.name = 'Ananya Reddy' AND gs.slug IN ('haircut','party-makeup','bridal-makeup','classic-facial','hydra-facial','glow-facial')
ON CONFLICT DO NOTHING;

-- Rahul (Jubilee Hills) - Hair specialist
INSERT INTO staff_services (staff_id, global_service_id)
SELECT s.id, gs.id FROM staff s, global_services gs
WHERE s.name = 'Rahul Verma' AND gs.slug IN ('haircut','hair-spa','keratin-treatment','hair-coloring','beard-styling','head-massage')
ON CONFLICT DO NOTHING;

-- Meera (Banjara Hills) - Skincare & makeup
INSERT INTO staff_services (staff_id, global_service_id)
SELECT s.id, gs.id FROM staff s, global_services gs
WHERE s.name = 'Meera Iyer' AND gs.slug IN ('classic-facial','hydra-facial','glow-facial','party-makeup','bridal-makeup','body-polishing')
ON CONFLICT DO NOTHING;

-- Karthik (Banjara Hills) - Grooming & hair
INSERT INTO staff_services (staff_id, global_service_id)
SELECT s.id, gs.id FROM staff s, global_services gs
WHERE s.name = 'Karthik Nair' AND gs.slug IN ('haircut','beard-styling','clean-shave','hair-spa','head-massage')
ON CONFLICT DO NOTHING;

-- Sneha (Gachibowli) - Basic services
INSERT INTO staff_services (staff_id, global_service_id)
SELECT s.id, gs.id FROM staff s, global_services gs
WHERE s.name = 'Sneha Gupta' AND gs.slug IN ('haircut','classic-facial','manicure','pedicure','head-massage')
ON CONFLICT DO NOTHING;

-- Arjun (Madhapur) - Hair & grooming
INSERT INTO staff_services (staff_id, global_service_id)
SELECT s.id, gs.id FROM staff s, global_services gs
WHERE s.name = 'Arjun Rao' AND gs.slug IN ('haircut','hair-spa','keratin-treatment','beard-styling','body-massage','head-massage')
ON CONFLICT DO NOTHING;

-- ============ STAFF SHIFTS ============
-- All staff work Mon-Sat, 9 AM to 9 PM
INSERT INTO staff_shifts (staff_id, branch_id, day_of_week, start_time, end_time)
SELECT s.id, s.branch_id, d.dow, '09:00', '21:00'
FROM staff s
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS d(dow)
ON CONFLICT DO NOTHING;

-- ============ MEMBERSHIPS ============
INSERT INTO memberships (organization_id, name, tier, hair_discount, skin_discount, product_discount, price, validity_days, benefits, status) VALUES
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Luxe Silver', 'Silver', 10, 5, 5, 2499, 365, '["10% off hair services","5% off skin services","5% off products","Priority booking"]', 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Luxe Gold', 'Gold', 20, 15, 10, 4999, 365, '["20% off hair services","15% off skin services","10% off products","Priority booking","Birthday benefit","Exclusive offers"]', 'active'),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Luxe Platinum', 'Platinum', 30, 25, 15, 9999, 365, '["30% off hair services","25% off skin services","15% off products","Priority booking","Birthday benefit","Exclusive offers","Free monthly head massage","Complimentary birthday service"]', 'active')
ON CONFLICT DO NOTHING;

-- ============ OFFERS ============
INSERT INTO offers (organization_id, branch_id, title, description, discount_type, discount_value, code, start_date, end_date, status, image_url) VALUES
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), NULL, 'First Visit 20% Off', 'New customers get 20% off their first service booking.', 'percentage', 20, 'FIRST20', '2026-01-01', '2026-12-31', 'active', NULL),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), NULL, 'Mon-Wed Flat 15% Off', 'Get flat 15% off on all services from Monday to Wednesday.', 'percentage', 15, 'MIDWEEK15', '2026-01-01', '2026-12-31', 'active', NULL),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), (SELECT id FROM branches WHERE slug='luxe-gachibowli'), 'Gachibowli Opening Special', 'Celebrate our new branch with 25% off all services this month.', 'percentage', 25, 'GACHI25', '2026-09-01', '2026-09-30', 'active', NULL)
ON CONFLICT DO NOTHING;

-- ============ PACKAGES ============
INSERT INTO packages (organization_id, name, description, price, validity_days, status, image_url) VALUES
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Hair Care Package', 'Complete hair care package with 3 hair spa sessions, 2 haircuts, and 1 scalp treatment.', 6999, 90, 'active', NULL),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Bridal Package', 'Full bridal preparation package including bridal makeup, facial, hair spa, manicure, and pedicure.', 14999, 60, 'active', NULL),
  ((SELECT id FROM organizations WHERE slug='luxe-salon'), 'Grooming Package', 'Men''s grooming package with 4 haircuts, 4 beard styling, and 2 head massages.', 2999, 90, 'active', NULL)
ON CONFLICT DO NOTHING;

-- Package services
INSERT INTO package_services (package_id, global_service_id, quantity)
SELECT (SELECT id FROM packages WHERE name='Hair Care Package'), gs.id, CASE gs.slug WHEN 'hair-spa' THEN 3 WHEN 'haircut' THEN 2 WHEN 'head-massage' THEN 1 END
FROM global_services gs
WHERE gs.slug IN ('hair-spa','haircut','head-massage')
ON CONFLICT DO NOTHING;

INSERT INTO package_services (package_id, global_service_id, quantity)
SELECT (SELECT id FROM packages WHERE name='Bridal Package'), gs.id, 1
FROM global_services gs
WHERE gs.slug IN ('bridal-makeup','glow-facial','hair-spa','manicure','pedicure')
ON CONFLICT DO NOTHING;

INSERT INTO package_services (package_id, global_service_id, quantity)
SELECT (SELECT id FROM packages WHERE name='Grooming Package'), gs.id, CASE gs.slug WHEN 'haircut' THEN 4 WHEN 'beard-styling' THEN 4 WHEN 'head-massage' THEN 2 END
FROM global_services gs
WHERE gs.slug IN ('haircut','beard-styling','head-massage')
ON CONFLICT DO NOTHING;

-- ============ SAMPLE REVIEWS ============
INSERT INTO reviews (branch_id, rating, comment, created_at) VALUES
  ((SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 5, 'Amazing experience! Priya did an incredible job with my hair. The salon is clean and the staff is very professional.', '2026-08-15T10:30:00Z'),
  ((SELECT id FROM branches WHERE slug='luxe-jubilee-hills'), 5, 'Best salon in Hyderabad. Ananya is a genius with makeup. Highly recommend for bridal services.', '2026-08-10T14:00:00Z'),
  ((SELECT id FROM branches WHERE slug='luxe-banjara-hills'), 5, 'Meera is fantastic! The hydra facial left my skin glowing. Worth every rupee.', '2026-08-20T16:00:00Z'),
  ((SELECT id FROM branches WHERE slug='luxe-gachibowli'), 4, 'Good service and reasonable prices. Sneha is very talented for a junior stylist.', '2026-08-18T11:00:00Z'),
  ((SELECT id FROM branches WHERE slug='luxe-madhapur'), 5, 'Arjun is excellent with men''s grooming. The beard styling was on point!', '2026-08-22T15:30:00Z')
ON CONFLICT DO NOTHING;
