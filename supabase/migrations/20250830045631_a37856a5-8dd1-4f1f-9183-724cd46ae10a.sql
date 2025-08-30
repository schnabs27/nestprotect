-- Create disaster_resources table
CREATE TABLE public.disaster_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  phone TEXT,
  website TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  distance_mi NUMERIC,
  source TEXT,
  source_id TEXT,
  hours TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_verified_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_resource_prefs table
CREATE TABLE public.user_resource_prefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT,
  resource_id UUID REFERENCES public.disaster_resources(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.disaster_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resource_prefs ENABLE ROW LEVEL SECURITY;

-- Create policies for disaster_resources (public read access)
CREATE POLICY "Public read access on disaster_resources" 
ON public.disaster_resources 
FOR SELECT 
USING (true);

-- Create policies for user_resource_prefs (users manage own prefs)
CREATE POLICY "Users can view their own resource preferences" 
ON public.user_resource_prefs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resource preferences" 
ON public.user_resource_prefs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resource preferences" 
ON public.user_resource_prefs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resource preferences" 
ON public.user_resource_prefs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_disaster_resources_location ON public.disaster_resources(latitude, longitude);
CREATE INDEX idx_disaster_resources_postal_code ON public.disaster_resources(postal_code);
CREATE INDEX idx_disaster_resources_last_seen ON public.disaster_resources(last_seen_at);
CREATE INDEX idx_user_resource_prefs_user_id ON public.user_resource_prefs(user_id);
CREATE INDEX idx_user_resource_prefs_resource_id ON public.user_resource_prefs(resource_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_disaster_resources_updated_at
  BEFORE UPDATE ON public.disaster_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_resource_prefs_updated_at
  BEFORE UPDATE ON public.user_resource_prefs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();