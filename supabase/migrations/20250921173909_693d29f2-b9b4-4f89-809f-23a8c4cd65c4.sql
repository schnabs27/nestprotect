-- Fix security vulnerability in contact_access_logs table
-- Replace the overly permissive INSERT policy with a secure one

-- Drop the existing insecure INSERT policy
DROP POLICY IF EXISTS "System can insert contact access logs" ON public.contact_access_logs;

-- Create a new secure INSERT policy that only allows service role operations
-- This ensures only the application backend can insert access logs, not end users
CREATE POLICY "Service role can insert contact access logs"
ON public.contact_access_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Also add a policy to allow authenticated users to insert their own access logs
-- but only with their own user_id to prevent impersonation
CREATE POLICY "Users can log their own access"
ON public.contact_access_logs  
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);