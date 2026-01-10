-- Fix the security warnings from the linter

-- Fix function search_path issues
CREATE OR REPLACE FUNCTION public.is_valid_zip_code(zip_code text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate ZIP code format (5 digits or 5+4 format)
  RETURN zip_code ~ '^[0-9]{5}(-[0-9]{4})?$';
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_secure_device_id()
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Generate a cryptographically secure device ID
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$;