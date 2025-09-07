-- Step 1: Drop existing policies and recreate them as secure and restrictive
DROP POLICY IF EXISTS "Select disaster resources for authenticated" ON public.disaster_resources;
DROP POLICY IF EXISTS "Admin access to disaster resources" ON public.disaster_resources;
DROP POLICY IF EXISTS "Block direct access to disaster resources" ON public.disaster_resources;

-- Step 2: Create restrictive RLS policies for authenticated users only
-- Users can only SELECT their own regional data (no INSERT/UPDATE/DELETE)
CREATE POLICY "Authenticated users can view regional disaster resources" 
ON public.disaster_resources 
FOR SELECT 
TO authenticated
USING (
  -- Allow if user has a profile with zip code that matches first 3 digits of resource
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND zip_code IS NOT NULL 
    AND postal_code IS NOT NULL
    AND LEFT(zip_code, 3) = LEFT(postal_code, 3)
  )
  OR public.is_admin()
);

-- Admin access for management
CREATE POLICY "Admins have full access to disaster resources"
ON public.disaster_resources
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Step 3: Only system/edge functions can insert/update disaster resources
-- Edge functions use service role, not user auth, so this is separate
CREATE POLICY "System can manage disaster resources"
ON public.disaster_resources
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);