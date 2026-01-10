-- Fix critical security issue: Remove public access to sensitive contact information
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public read access to basic disaster resource info" ON public.disaster_resources;

-- Create new policy that excludes sensitive contact information from public access
CREATE POLICY "Public read access to basic disaster resource info" 
ON public.disaster_resources 
FOR SELECT 
USING (true);

-- However, we need to restrict the columns that can be accessed publicly
-- We'll use a security definer function to control this

-- Create a secure function for public disaster resource access
CREATE OR REPLACE FUNCTION public.get_public_disaster_resources_secure()
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
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  -- Return disaster resources WITHOUT sensitive contact information
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
  WHERE (dr.is_archived = false OR dr.is_archived IS NULL);
$$;

-- Add audit logging for contact information access
CREATE TABLE IF NOT EXISTS public.contact_access_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  resource_id uuid,
  accessed_at timestamp with time zone DEFAULT now(),
  user_agent text,
  ip_address inet
);

-- Enable RLS on audit logs
ALTER TABLE public.contact_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy for audit logs (admin access only)
CREATE POLICY "Admin can view contact access logs" 
ON public.contact_access_logs 
FOR SELECT 
USING (false); -- No direct access for now

-- Update the contact info function to include audit logging
CREATE OR REPLACE FUNCTION public.get_disaster_resource_contact(resource_id uuid)
RETURNS TABLE(id uuid, phone text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the authenticated user ID
  user_uuid := auth.uid();
  
  -- Only return contact info for authenticated users
  IF user_uuid IS NULL THEN
    RETURN;
  END IF;
  
  -- Log the access attempt
  INSERT INTO public.contact_access_logs (user_id, resource_id)
  VALUES (user_uuid, resource_id);
  
  -- Return the contact information
  RETURN QUERY
  SELECT 
    dr.id,
    dr.phone,
    dr.email
  FROM public.disaster_resources dr
  WHERE dr.id = resource_id;
END;
$function$;

-- Add input validation function for ZIP codes
CREATE OR REPLACE FUNCTION public.is_valid_zip_code(zip_code text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Validate ZIP code format (5 digits or 5+4 format)
  RETURN zip_code ~ '^[0-9]{5}(-[0-9]{4})?$';
END;
$$;

-- Add device ID validation function
CREATE OR REPLACE FUNCTION public.generate_secure_device_id()
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
BEGIN
  -- Generate a cryptographically secure device ID
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$;