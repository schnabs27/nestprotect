-- Remove the overly permissive policy that allows unrestricted access
DROP POLICY IF EXISTS "Limited disaster resources access" ON public.disaster_resources;

-- Verify we only have the secure policies in place
-- 1. "Block direct access to disaster resources" - blocks all access (qual: false)
-- 2. "Admin access to disaster resources" - allows admin access only (qual: is_admin())

-- These are the only two policies that should exist for proper security