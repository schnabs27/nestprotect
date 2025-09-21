-- Add a policy to allow counting all profiles for the user counter
CREATE POLICY "Anyone can count profiles" 
ON public.profiles 
FOR SELECT 
USING (true);