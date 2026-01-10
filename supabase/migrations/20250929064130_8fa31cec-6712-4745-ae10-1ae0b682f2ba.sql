-- Disable RLS on zips_with_risks table to make it publicly accessible
-- This data needs to be public since users access it without authentication
ALTER TABLE public.zips_with_risks DISABLE ROW LEVEL SECURITY;