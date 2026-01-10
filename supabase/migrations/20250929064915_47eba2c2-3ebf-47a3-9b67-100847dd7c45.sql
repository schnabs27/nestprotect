-- Re-enable RLS on zips_with_risks table and create proper public access policy
-- This fixes the security issue while maintaining public access to FEMA risk data

-- Re-enable Row Level Security on zips_with_risks table
ALTER TABLE public.zips_with_risks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to all risk data
-- This data is public FEMA information and should be readable by everyone
CREATE POLICY "Public read access to risk data" 
ON public.zips_with_risks 
FOR SELECT 
USING (true);

-- Add policy to prevent unauthorized modifications
-- Only service role should be able to insert/update this data
CREATE POLICY "Service role can manage risk data" 
ON public.zips_with_risks 
FOR ALL 
USING (auth.role() = 'service_role'::text);