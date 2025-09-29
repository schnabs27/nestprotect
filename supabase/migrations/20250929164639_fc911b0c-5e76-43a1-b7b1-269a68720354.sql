-- Fix security issue: Remove client-side access log insertion capability
-- Only service role should be able to insert tracking data to prevent manipulation

-- Remove the policy that allows users to insert their own access logs
-- This prevents client-side manipulation of sensitive tracking data
DROP POLICY IF EXISTS "Users can log their own access" ON public.contact_access_logs;

-- Keep existing secure policies:
-- 1. "Admins can view contact access logs" (SELECT for admins) - secure for audit purposes
-- 2. "Service role can insert contact access logs" (INSERT for service role) - secure for system logging

-- Add documentation comment
COMMENT ON TABLE public.contact_access_logs IS 'Sensitive user tracking data containing IP addresses and user agents. Access restricted to: admins (SELECT only for auditing) and service role (INSERT only for system logging). No direct user access to prevent data manipulation.';