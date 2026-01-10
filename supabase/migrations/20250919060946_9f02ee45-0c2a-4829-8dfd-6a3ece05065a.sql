-- Fix infinite recursion in user_roles RLS policies

-- Drop the problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Keep only the basic user policy for viewing their own roles
-- This policy allows authenticated users to view their own roles only
CREATE POLICY IF NOT EXISTS "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- For admin operations, we'll handle them through the application layer or separate admin interface
-- This prevents the infinite recursion issue while maintaining security