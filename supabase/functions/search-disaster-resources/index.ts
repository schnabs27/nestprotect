import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DisasterResource {
  name: string;
  category: string;
  description: string;
  phone?: string;
  website?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  distance_mi?: number;
  source: string;
  source_id: string;
  hours?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipCode } = await req.json();
    
    if (!zipCode) {
      return new Response(
        JSON.stringify({ error: 'ZIP code is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting disaster resource search for ZIP: ${zipCode}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for cached results (24h cache)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: cachedResults } = await supabase
      .from('disaster_resources')
      .select('*')
      .eq('postal_code', zipCode)
      .gte('last_seen_at', oneDayAgo)
      .order('distance_mi', { ascending: true });

    if (cachedResults && cachedResults.length > 0) {
      console.log(`Found ${cachedResults.length} cached results for ZIP ${zipCode}`);
      return new Response(
        JSON.stringify({ 
          resources: cachedResults, 
          cached: true, 
          cachedAt: cachedResults[0]?.last_seen_at 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Aggregate data from Google Maps Places API only (for now)
    const results: DisasterResource[] = [];
    const errors: string[] = [];

    // Call Google Maps Places API
    try {
      console.log('Calling Google Maps Places API...');
      const mapsApiKey = Deno.env.get('MAPS_API_KEY');
      
      if (!mapsApiKey) {
        errors.push('Google Maps API key not configured');
        console.error('Google Maps API key missing from environment variables');
        return new Response(
          JSON.stringify({ 
            resources: [],
            cached: false,
            errors: ['Google Maps API key not configured. Please add MAPS_API_KEY to Supabase secrets.']
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Google Maps API key found, length:', mapsApiKey.length);
      
      // First, geocode the ZIP code to get coordinates
      console.log(`Geocoding ZIP code: ${zipCode}`);
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${mapsApiKey}`;
      console.log('Geocoding URL (key hidden):', geocodeUrl.replace(mapsApiKey, 'HIDDEN_KEY'));
      
      const geocodeResponse = await fetch(geocodeUrl);
      console.log('Geocode response status:', geocodeResponse.status, geocodeResponse.statusText);
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          console.log(`Geocode response:`, JSON.stringify(geocodeData, null, 2));
          
          if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            console.log(`Location found: ${location.lat}, ${location.lng}`);
            
            // Search for relevant places with broader search approach
            const searchQueries = [
              'food bank',
              'emergency shelter',
              'hospital',
              'fire station', 
              'police station',
              'community center',
              'red cross',
              'salvation army',
              'food pantry',
              'homeless shelter'
            ];
            
            for (const query of searchQueries) {
              console.log(`Searching for: ${query} near ${zipCode}`);
              
              // Use NEW Places API (Text Search)
              const placesUrl = `https://places.googleapis.com/v1/places:searchText`;
              console.log('Places search URL:', placesUrl);
              
              const requestBody = {
                textQuery: `${query} near ${zipCode}`,
                locationBias: {
                  circle: {
                    center: {
                      latitude: location.lat,
                      longitude: location.lng
                    },
                    radius: 50000.0
                  }
                },
                maxResultCount: 10
              };
              
              console.log('Places API request body:', JSON.stringify(requestBody, null, 2));
              
              const placesResponse = await fetch(placesUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Goog-Api-Key': mapsApiKey,
                  'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.types,places.id,places.businessStatus'
                },
                body: JSON.stringify(requestBody)
              });
              console.log(`Places API response status for "${query}":`, placesResponse.status, placesResponse.statusText);
              
              if (placesResponse.ok) {
                const placesData = await placesResponse.json();
                console.log(`Places API response for "${query}":`, JSON.stringify({
                  placesCount: placesData?.places?.length || 0,
                  hasPlaces: !!placesData.places
                }, null, 2));
                
                if (placesData.places && placesData.places.length > 0) {
                  console.log(`Processing ${placesData.places.length} results for "${query}"`);
                  
                  for (const place of placesData.places.slice(0, 5)) { // Limit to first 5 results per query
                    // Calculate distance from ZIP center
                    const distance = calculateDistance(
                      location.lat, location.lng,
                      place.location.latitude, place.location.longitude
                    );
                    
                    console.log(`Found ${place.displayName?.text || 'Unknown'} at distance: ${distance.toFixed(1)} miles`);
                    
                    if (distance <= 30) { // Within 30 miles
                      results.push({
                        name: place.displayName?.text || 'Unknown Place',
                        category: categorizePlace(query, place.types || []),
                        description: `${place.types?.slice(0, 2).join(', ') || query} - ${place.formattedAddress || ''}`,
                        phone: '',
                        website: '',
                        address: place.formattedAddress || '',
                        city: extractCity(place.formattedAddress || ''),
                        state: extractState(place.formattedAddress || ''),
                        postal_code: zipCode,
                        latitude: place.location.latitude,
                        longitude: place.location.longitude,
                        distance_mi: Math.round(distance * 10) / 10,
                        source: 'Google Maps',
                        source_id: place.id || '',
                        hours: ''
                      });
                      console.log(`Added ${place.displayName?.text || 'Unknown'} to results`);
                    } else {
                      console.log(`${place.displayName?.text || 'Unknown'} excluded - outside 30 mile radius (${distance.toFixed(1)} miles)`);
                    }
                  }
                } else {
                  console.log(`No results for "${query}": response contains no places`);
                }
              } else {
                console.error(`Places API HTTP error for "${query}":`, placesResponse.status, placesResponse.statusText);
                const errorText = await placesResponse.text();
                console.error('Error response body:', errorText);
                errors.push(`Places API HTTP error: ${placesResponse.status}`);
              }
              
              // Small delay to avoid rate limits
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } else if (geocodeData.status === 'REQUEST_DENIED') {
            errors.push(`Google Geocoding API access denied: ${geocodeData.error_message}`);
            console.error('Geocoding REQUEST DENIED:', geocodeData.error_message);
          } else {
            errors.push(`Could not geocode ZIP code: ${zipCode} (Status: ${geocodeData.status})`);
            console.error('Geocoding failed:', geocodeData.status, geocodeData.error_message);
          }
        } else {
          errors.push('Google Geocoding API request failed');
          console.error('Geocoding API HTTP error:', geocodeResponse.status, geocodeResponse.statusText);
          const errorText = await geocodeResponse.text();
          console.error('Geocoding error response:', errorText);
        }
      }
    } catch (error) {
      errors.push('Google Maps API error');
      console.error('Google Maps API error:', error);
    }
    // Remove duplicates based on name and location proximity
    const uniqueResults = removeDuplicates(results);
    console.log(`Filtered ${results.length} results down to ${uniqueResults.length} unique results`);

    // Store results in database
    if (uniqueResults.length > 0) {
      console.log(`Storing ${uniqueResults.length} results in database...`);
      
      // Upsert results
      for (const resource of uniqueResults) {
        await supabase
          .from('disaster_resources')
          .upsert({
            ...resource,
            last_seen_at: new Date().toISOString()
          }, {
            onConflict: 'source,source_id'
          });
      }
    }

    console.log(`Search completed. Found ${uniqueResults.length} resources, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ 
        resources: uniqueResults,
        cached: false,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-disaster-resources function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to get place type for new Places API
function getPlaceType(query: string): string {
  query = query.toLowerCase();
  
  if (query.includes('food') || query.includes('bank') || query.includes('pantry')) {
    return 'food';
  }
  if (query.includes('shelter') || query.includes('homeless')) {
    return 'lodging';
  }
  if (query.includes('hospital')) {
    return 'hospital';
  }
  if (query.includes('fire')) {
    return 'fire_station';
  }
  if (query.includes('police')) {
    return 'police';
  }
  if (query.includes('community')) {
    return 'community_center';
  }
  
  return 'establishment';
}

// Helper function to categorize places based on search query and types
function categorizePlace(query: string, types: string[]): string {
  query = query.toLowerCase();
  const typeString = types.join(' ').toLowerCase();
  
  if (query.includes('food') || query.includes('bank') || typeString.includes('food')) {
    return 'food';
  }
  if (query.includes('shelter') || typeString.includes('lodging')) {
    return 'shelter';
  }
  if (query.includes('hospital') || query.includes('medical') || typeString.includes('hospital')) {
    return 'medical';
  }
  if (query.includes('fire') || typeString.includes('fire')) {
    return 'emergency services';
  }
  if (query.includes('police') || typeString.includes('police')) {
    return 'emergency services';
  }
  if (query.includes('red cross') || query.includes('salvation army') || query.includes('united way')) {
    return 'relief organization';
  }
  
  return 'general';
}

// Helper function to extract city from formatted address
function extractCity(address: string): string {
  const parts = address.split(',');
  return parts.length >= 2 ? parts[parts.length - 3]?.trim() || '' : '';
}

// Helper function to extract state from formatted address
function extractState(address: string): string {
  const parts = address.split(',');
  const lastPart = parts[parts.length - 2]?.trim() || '';
  return lastPart.split(' ')[0] || '';
}

// Helper function to remove duplicate resources
function removeDuplicates(resources: DisasterResource[]): DisasterResource[] {
  const unique: DisasterResource[] = [];
  const seen = new Set<string>();
  
  for (const resource of resources) {
    // Create a key based on name and approximate location
    const key = `${resource.name.toLowerCase()}_${Math.round(resource.latitude || 0)}_${Math.round(resource.longitude || 0)}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(resource);
    }
  }
  
  return unique;
}