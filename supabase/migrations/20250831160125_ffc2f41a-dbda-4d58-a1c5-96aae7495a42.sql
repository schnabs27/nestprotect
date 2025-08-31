-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, zip_code)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'zip_code');
  RETURN NEW;
END;
$$;