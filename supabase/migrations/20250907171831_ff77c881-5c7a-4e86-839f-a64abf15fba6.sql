-- Add unique constraint for source and source_id to enable proper upsert functionality
ALTER TABLE public.disaster_resources 
ADD CONSTRAINT disaster_resources_source_source_id_unique 
UNIQUE (source, source_id);

-- Add index on postal_code and last_seen_at for better cache query performance
CREATE INDEX IF NOT EXISTS idx_disaster_resources_cache_lookup 
ON public.disaster_resources (postal_code, last_seen_at DESC);