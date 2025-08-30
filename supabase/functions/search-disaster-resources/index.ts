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

    // Aggregate data from multiple sources
    const results: DisasterResource[] = [];
    const errors: string[] = [];

    // 1. Call 211 API
    try {
      console.log('Calling 211 API...');
      const response211 = await fetch(
        `https://api.211.org/search/v1/api/Search/Guided?TaxonomyCode=BD-1800&Location=${zipCode}&Distance=30&Top=50&OrderBy=Distance`
      );
      
      if (response211.ok) {
        const data211 = await response211.json();
        console.log(`211 API returned ${data211?.Organizations?.length || 0} results`);
        
        if (data211.Organizations) {
          for (const org of data211.Organizations) {
            results.push({
              name: org.Name || 'Unknown Organization',
              category: org.Services?.[0]?.ServiceName || 'General',
              description: org.Description || '',
              phone: org.Phone || '',
              website: org.Website || '',
              email: org.Email || '',
              address: org.Address || '',
              city: org.City || '',
              state: org.State || '',
              postal_code: zipCode,
              latitude: parseFloat(org.Latitude) || null,
              longitude: parseFloat(org.Longitude) || null,
              distance_mi: parseFloat(org.Distance) || null,
              source: '211',
              source_id: org.Id?.toString() || '',
              hours: org.Hours || ''
            });
          }
        }
      } else {
        errors.push('211 API request failed');
        console.error('211 API error:', response211.status);
      }
    } catch (error) {
      errors.push('211 API timeout or error');
      console.error('211 API error:', error);
    }

    // 2. Call Google Maps Places API
    try {
      console.log('Calling Google Maps Places API...');
      const mapsApiKey = Deno.env.get('MAPS_API_KEY');
      if (!mapsApiKey) {
        errors.push('Google Maps API key not configured');
      } else {
        // First, geocode the ZIP code to get coordinates
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${mapsApiKey}`
        );
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            
            // Search for relevant places
            const searchTypes = ['hospital', 'fire_station', 'police', 'local_government_office'];
            
            for (const type of searchTypes) {
              const placesResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=48280&type=${type}&key=${mapsApiKey}`
              );
              
              if (placesResponse.ok) {
                const placesData = await placesResponse.json();
                console.log(`Google Places API returned ${placesData?.results?.length || 0} results for ${type}`);
                
                if (placesData.results) {
                  for (const place of placesData.results) {
                    // Calculate distance from ZIP center
                    const distance = calculateDistance(
                      location.lat, location.lng,
                      place.geometry.location.lat, place.geometry.location.lng
                    );
                    
                    if (distance <= 30) { // Within 30 miles
                      results.push({
                        name: place.name || 'Unknown Place',
                        category: type.replace('_', ' '),
                        description: place.types?.join(', ') || '',
                        phone: place.formatted_phone_number || '',
                        website: place.website || '',
                        address: place.vicinity || '',
                        city: '',
                        state: '',
                        postal_code: zipCode,
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng,
                        distance_mi: distance,
                        source: 'Google Maps',
                        source_id: place.place_id || '',
                        hours: place.opening_hours?.weekday_text?.join('; ') || ''
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      errors.push('Google Maps API error');
      console.error('Google Maps API error:', error);
    }

    // 3. Use OpenAI for data cleanup and deduplication
    try {
      console.log('Processing with OpenAI for cleanup and deduplication...');
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        errors.push('OpenAI API key not configured');
      } else if (results.length > 0) {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a data cleanup assistant. Remove duplicate disaster relief resources, normalize descriptions to ~160 chars, and categorize properly. Return clean JSON array.'
              },
              {
                role: 'user',
                content: `Clean and deduplicate these disaster relief resources:\n${JSON.stringify(results.slice(0, 20))}`
              }
            ],
            max_tokens: 2000,
            temperature: 0.1
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const cleanedData = openaiData.choices[0].message.content;
          console.log('OpenAI cleanup completed');
          
          try {
            const cleanedResults = JSON.parse(cleanedData);
            if (Array.isArray(cleanedResults)) {
              results.splice(0, results.length, ...cleanedResults);
            }
          } catch (parseError) {
            console.error('Failed to parse OpenAI response:', parseError);
          }
        }
      }
    } catch (error) {
      errors.push('OpenAI processing error');
      console.error('OpenAI error:', error);
    }

    // Store results in database
    if (results.length > 0) {
      console.log(`Storing ${results.length} results in database...`);
      
      // Upsert results
      for (const resource of results) {
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

    console.log(`Search completed. Found ${results.length} resources, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ 
        resources: results,
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