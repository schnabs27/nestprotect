-- Add a policy to allow counting all profiles for the user counter
CREATE POLICY "Anyone can count profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Enable realtime for the profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;