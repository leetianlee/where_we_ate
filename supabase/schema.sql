-- Where We Ate - Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FAMILIES TABLE
-- ============================================
CREATE TABLE public.families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Generate new invite code function
CREATE OR REPLACE FUNCTION public.regenerate_invite_code(family_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  UPDATE public.families SET invite_code = new_code, updated_at = NOW() WHERE id = family_uuid;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FAMILY MEMBERS TABLE (junction table)
-- ============================================
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');

CREATE TABLE public.family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role member_role DEFAULT 'member' NOT NULL,
  nickname TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(family_id, user_id)
);

-- ============================================
-- RESTAURANTS TABLE
-- ============================================
CREATE TABLE public.restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  cuisine TEXT,
  address TEXT,
  website TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- VISITS TABLE
-- ============================================
CREATE TABLE public.visits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  value_for_money INTEGER CHECK (value_for_money >= 1 AND value_for_money <= 5),
  total_bill DECIMAL(10, 2),
  number_of_people INTEGER CHECK (number_of_people >= 1),
  would_recommend BOOLEAN,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- VISIT ATTENDEES TABLE
-- ============================================
CREATE TABLE public.visit_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  personal_notes TEXT,
  UNIQUE(visit_id, user_id)
);

-- ============================================
-- DISHES TABLE
-- ============================================
CREATE TABLE public.dishes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  price DECIMAL(10, 2),
  notes TEXT,
  ordered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_family_members_family ON public.family_members(family_id);
CREATE INDEX idx_family_members_user ON public.family_members(user_id);
CREATE INDEX idx_restaurants_family ON public.restaurants(family_id);
CREATE INDEX idx_visits_restaurant ON public.visits(restaurant_id);
CREATE INDEX idx_visits_family ON public.visits(family_id);
CREATE INDEX idx_visits_date ON public.visits(date DESC);
CREATE INDEX idx_dishes_visit ON public.dishes(visit_id);
CREATE INDEX idx_visit_attendees_visit ON public.visit_attendees(visit_id);
CREATE INDEX idx_families_invite_code ON public.families(invite_code);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update own
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Families: Members can view their families
CREATE POLICY "Users can view their families" ON public.families
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create families" ON public.families
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners and admins can update families" ON public.families
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT family_id FROM public.family_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Allow reading family by invite code (for joining)
CREATE POLICY "Anyone can read family by invite code" ON public.families
  FOR SELECT TO authenticated
  USING (invite_code IS NOT NULL);

-- Family Members: Members can view other members in their family
CREATE POLICY "Members can view family members" ON public.family_members
  FOR SELECT TO authenticated
  USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join families" ON public.family_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can manage members" ON public.family_members
  FOR DELETE TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM public.family_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    OR user_id = auth.uid() -- Users can leave
  );

CREATE POLICY "Members can update their own membership" ON public.family_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Restaurants: Family members can CRUD restaurants
CREATE POLICY "Family members can view restaurants" ON public.restaurants
  FOR SELECT TO authenticated
  USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Family members can create restaurants" ON public.restaurants
  FOR INSERT TO authenticated
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Family members can update restaurants" ON public.restaurants
  FOR UPDATE TO authenticated
  USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Family members can delete restaurants" ON public.restaurants
  FOR DELETE TO authenticated
  USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

-- Visits: Family members can CRUD visits
CREATE POLICY "Family members can view visits" ON public.visits
  FOR SELECT TO authenticated
  USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Family members can create visits" ON public.visits
  FOR INSERT TO authenticated
  WITH CHECK (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Family members can update visits" ON public.visits
  FOR UPDATE TO authenticated
  USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Family members can delete visits" ON public.visits
  FOR DELETE TO authenticated
  USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

-- Visit Attendees: Family members can manage attendees
CREATE POLICY "Family members can view attendees" ON public.visit_attendees
  FOR SELECT TO authenticated
  USING (
    visit_id IN (
      SELECT id FROM public.visits WHERE family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can add attendees" ON public.visit_attendees
  FOR INSERT TO authenticated
  WITH CHECK (
    visit_id IN (
      SELECT id FROM public.visits WHERE family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own attendance" ON public.visit_attendees
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Family members can remove attendees" ON public.visit_attendees
  FOR DELETE TO authenticated
  USING (
    visit_id IN (
      SELECT id FROM public.visits WHERE family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
      )
    )
  );

-- Dishes: Family members can manage dishes
CREATE POLICY "Family members can view dishes" ON public.dishes
  FOR SELECT TO authenticated
  USING (
    visit_id IN (
      SELECT id FROM public.visits WHERE family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can add dishes" ON public.dishes
  FOR INSERT TO authenticated
  WITH CHECK (
    visit_id IN (
      SELECT id FROM public.visits WHERE family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can update dishes" ON public.dishes
  FOR UPDATE TO authenticated
  USING (
    visit_id IN (
      SELECT id FROM public.visits WHERE family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Family members can delete dishes" ON public.dishes
  FOR DELETE TO authenticated
  USING (
    visit_id IN (
      SELECT id FROM public.visits WHERE family_id IN (
        SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Restaurant stats view
CREATE OR REPLACE VIEW public.restaurant_stats AS
SELECT
  r.id,
  r.family_id,
  r.name,
  r.cuisine,
  r.address,
  COUNT(v.id) as visit_count,
  ROUND(AVG(v.overall_rating), 1) as avg_rating,
  ROUND(AVG(v.total_bill), 2) as avg_price,
  MAX(v.date) as last_visit
FROM public.restaurants r
LEFT JOIN public.visits v ON r.id = v.restaurant_id
GROUP BY r.id;

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.family_members;
