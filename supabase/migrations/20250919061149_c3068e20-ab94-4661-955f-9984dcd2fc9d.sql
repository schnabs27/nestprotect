-- Fix all security definer functions to have proper search paths

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- Fix handle_new_user function 
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, zip_code)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'zip_code');
  RETURN NEW;
END;
$$;

-- Fix get_disaster_resource_contact_secure function
CREATE OR REPLACE FUNCTION public.get_disaster_resource_contact_secure(resource_id uuid)
RETURNS TABLE(id uuid, phone text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  user_zip_code text;
  resource_zip_code text;
BEGIN
  -- Get the authenticated user ID
  user_uuid := auth.uid();
  
  -- Only return contact info for authenticated users
  IF user_uuid IS NULL THEN
    RETURN;
  END IF;

  -- Get user's zip code from their profile
  SELECT zip_code INTO user_zip_code
  FROM public.profiles
  WHERE user_id = user_uuid;

  -- Get the resource's zip code
  SELECT postal_code INTO resource_zip_code
  FROM public.disaster_resources
  WHERE disaster_resources.id = resource_id;

  -- Allow access if:
  -- 1. User has a zip code in their profile AND resource has a zip code AND they match the first 3 digits (general area)
  -- 2. OR user is an admin
  IF (user_zip_code IS NOT NULL AND resource_zip_code IS NOT NULL AND 
      LEFT(user_zip_code, 3) = LEFT(resource_zip_code, 3)) OR
     public.is_admin() THEN
    
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
  END IF;
  
  -- If conditions not met, return nothing (no access)
  RETURN;
END;
$$;

-- Fix can_access_contact_info_secure function
CREATE OR REPLACE FUNCTION public.can_access_contact_info_secure(resource_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  user_zip_code text;
  resource_zip_code text;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user is admin
  IF public.is_admin() THEN
    RETURN true;
  END IF;

  -- Get user's zip code
  SELECT zip_code INTO user_zip_code
  FROM public.profiles
  WHERE user_id = user_uuid;

  -- Get resource's zip code
  SELECT postal_code INTO resource_zip_code
  FROM public.disaster_resources
  WHERE disaster_resources.id = resource_id;

  -- Allow if zip codes match the first 3 digits (general area)
  RETURN (user_zip_code IS NOT NULL AND resource_zip_code IS NOT NULL AND 
          LEFT(user_zip_code, 3) = LEFT(resource_zip_code, 3));
END;
$$;

-- Fix get_disaster_resource_contact function
CREATE OR REPLACE FUNCTION public.get_disaster_resource_contact(resource_id uuid)
RETURNS TABLE(id uuid, phone text, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix can_access_contact_info function
CREATE OR REPLACE FUNCTION public.can_access_contact_info()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Fix get_public_disaster_resources_secure function
CREATE OR REPLACE FUNCTION public.get_public_disaster_resources_secure()
RETURNS TABLE(id uuid, name text, category text, description text, address text, city text, state text, postal_code text, website text, hours text, latitude numeric, longitude numeric, distance_mi numeric, source text, created_at timestamp with time zone, updated_at timestamp with time zone, last_verified_at timestamp with time zone, last_seen_at timestamp with time zone, is_archived boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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

-- Fix get_disaster_resources_public function
CREATE OR REPLACE FUNCTION public.get_disaster_resources_public()
RETURNS TABLE(id uuid, name text, category text, description text, address text, city text, state text, postal_code text, website text, hours text, latitude numeric, longitude numeric, distance_mi numeric, source text, source_id text, created_at timestamp with time zone, updated_at timestamp with time zone, last_verified_at timestamp with time zone, last_seen_at timestamp with time zone, is_archived boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- Return disaster resources WITHOUT sensitive contact information (email, phone)
  -- This function can be called by anyone, including unauthenticated users
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
    dr.source_id,
    dr.created_at,
    dr.updated_at,
    dr.last_verified_at,
    dr.last_seen_at,
    dr.is_archived
  FROM public.disaster_resources dr
  WHERE (dr.is_archived = false OR dr.is_archived IS NULL);
$$;

-- Fix is_valid_zip_code function
CREATE OR REPLACE FUNCTION public.is_valid_zip_code(zip_code text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate ZIP code format (5 digits or 5+4 format)
  RETURN zip_code ~ '^[0-9]{5}(-[0-9]{4})?$';
END;
$$;

-- Fix generate_secure_device_id function
CREATE OR REPLACE FUNCTION public.generate_secure_device_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Generate a cryptographically secure device ID
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$;