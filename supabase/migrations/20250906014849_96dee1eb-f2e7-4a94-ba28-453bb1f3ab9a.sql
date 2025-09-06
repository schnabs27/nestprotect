-- Fix the security issues from the linter

-- 1. Remove the problematic view and create a proper function instead
DROP VIEW public.disaster_resources_public;

-- 2. Create a function to get public disaster resources (addressing security definer issue)
CREATE OR REPLACE FUNCTION public.get_public_disaster_resources()
RETURNS TABLE(
  id uuid,
  name text,
  category text,
  description text,
  address text,
  city text,
  state text,
  postal_code text,
  website text,
  hours text,
  latitude numeric,
  longitude numeric,
  distance_mi numeric,
  source text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  last_verified_at timestamp with time zone,
  last_seen_at timestamp with time zone,
  is_archived boolean
) 
LANGUAGE sql
STABLE
SECURITY INVOKER  -- Use SECURITY INVOKER instead of DEFINER
SET search_path = public
AS $$
  SELECT 
    dr.id,
    dr.name,
    dr.category,
    dr.description,
    dr.address,
    dr.city,
    dr.state,
    dr.postal_code,
    dr.website,
    dr.hours,
    dr.latitude,
    dr.longitude,
    dr.distance_mi,
    dr.source,
    dr.created_at,
    dr.updated_at,
    dr.last_verified_at,
    dr.last_seen_at,
    dr.is_archived
  FROM public.disaster_resources dr
  WHERE dr.is_archived = false OR dr.is_archived IS NULL;
$$;

-- Grant execute permission to both anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_disaster_resources() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_disaster_resources() TO authenticated;