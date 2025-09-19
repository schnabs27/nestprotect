-- Drop existing functions that need return type changes
DROP FUNCTION IF EXISTS public.get_public_disaster_resources_secure();
DROP FUNCTION IF EXISTS public.get_disaster_resources_public();
DROP FUNCTION IF EXISTS public.get_disaster_resource_contact_secure(uuid);
DROP FUNCTION IF EXISTS public.get_disaster_resource_contact(uuid);