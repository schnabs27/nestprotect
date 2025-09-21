-- Remove the overly permissive policy that exposes user data
DROP POLICY IF EXISTS "Anyone can count profiles" ON public.profiles;

-- Create a secure function to get user count without exposing profile data
CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.profiles;
$$;

-- Grant execute permission to anonymous users for the count function
GRANT EXECUTE ON FUNCTION public.get_user_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_count() TO authenticated;