import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = 'https://mbddyejgznxdlabnlght.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { zipCode } = body;

    // Single ZIP code validation
    const zipCodeRegex = /^[0-9]{5}(-[0-9]{4})?$/;
    const sanitizedZipCode = zipCode?.trim();
    
    if (!sanitizedZipCode || !zipCodeRegex.test(sanitizedZipCode)) {
      return new Response(JSON.stringify({
        error: 'Invalid ZIP code format. Use 5 digits (e.g., 12345) or 5+4 format (e.g., 12345-6789)'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log(`Starting recovery services search for ZIP: ${sanitizedZipCode}`);

    // Check for cached results (24h cache)
    let cachedResults = [];
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error: cacheError } = await supabase
        .from('disaster_resources')
        .select('*')
        .eq('requested_zipcode', sanitizedZipCode)
        .eq('source', 'Google Maps Recovery')
        .gte('created_at', oneDayAgo);

      if (!cacheError && data && data.length > 0) {
        cachedResults = data;
        // Update cache timestamps
        await supabase
          .from('disaster_resources')
          .update({
            created_at: new Date().toISOString()
          })
          .eq('requested_zipcode', sanitizedZipCode)
          .eq('source', 'Google Maps Recovery')
          .gte('created_at', oneDayAgo);

        console.log(`Found ${cachedResults.length} cached results`);
        return new Response(JSON.stringify({
          resources: cachedResults,
          cached: true
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('Cache lookup failed, proceeding with Google search:', errorMessage);
    }

    // Google Maps search
    const results = [];
    const mapsApiKey = Deno.env.get('MAPS_API_KEY');
    
    if (!mapsApiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Geocode ZIP code
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${sanitizedZipCode}&key=${mapsApiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    
    if (!geocodeResponse.ok) {
      throw new Error('Geocoding failed');
    }

    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.status !== 'OK' || !geocodeData.results?.[0]) {
      throw new Error('Invalid ZIP code or geocoding failed');
    }

    const location = geocodeData.results[0].geometry.location;
    console.log(`Location: ${location.lat}, ${location.lng}`);

    // Recovery services search
    console.log('Starting recovery services search');

    const placesUrl = `https://places.googleapis.com/v1/places:searchNearby`;

    // Valid, supported types for Places API v1
    const VALID_TYPES = [
      'roofing_contractor',
      'painter',
      'plumber',
      'electrician',
      'moving_company',
      'hardware_store',
      'home_goods_store',
      'car_rental',
      'self_storage',
    ];

    // Helper to chunk array (API may limit number of types per request)
    function chunkArray(arr: string[], size: number) {
      const chunks: string[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    }

    const typeChunks = chunkArray(VALID_TYPES, 5);

    for (const types of typeChunks) {
      const requestBody = {
        includedTypes: types,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng,
            },
            radius: 40000.0, // ~25 miles
          },
        },
      };

      console.log('Places API request (types):', JSON.stringify(types));

      const placesResponse = await fetch(placesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': mapsApiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.types,places.id,places.businessStatus,places.nationalPhoneNumber,places.googleMapsUri',
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`Places API response status: ${placesResponse.status} for types: ${types.join(',')}`);

      if (!placesResponse.ok) {
        const errorText = await placesResponse.text();
        console.error('Places API error response:', errorText);
        continue;
      }

      const placesData = await placesResponse.json();
      const count = placesData.places?.length || 0;
      console.log(`Found ${count} places for types: ${types.join(',')}`);

      if (count > 0) {
        for (const place of placesData.places) {
          const address = parseAddress(place.formattedAddress || '');
          const placeName = place.displayName?.text || 'Unknown Place';
          const placeTypes = place.types || [];

          const categories = categorizePlace(placeTypes);

          results.push({
            name: placeName,
            categories: categories,
            description:
              categories.join(', ') ||
              placeTypes
                .filter((t: string) => t !== 'point_of_interest' && t !== 'establishment')
                .slice(0, 2)
                .join(', ')
                .replace(/_/g, ' '),
            phone: place.nationalPhoneNumber || '',
            url: place.googleMapsUri || `https://maps.google.com/maps/place/?q=place_id:${place.id}`,
            address: address,
            requested_zipcode: sanitizedZipCode,
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            source: 'Google Maps Recovery',
            source_id: place.id || '',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // Remove duplicates and store in database
    const uniqueResults = removeDuplicates(results);

    // Store results in database
    if (uniqueResults.length > 0) {
      const { error: insertError } = await supabase
        .from('disaster_resources')
        .upsert(uniqueResults, {
          onConflict: 'source,source_id'
        });

      if (insertError) {
        console.log('Database storage failed:', insertError.message);
      } else {
        console.log('Results stored successfully');
      }
    }

    console.log(`Search completed. Found ${uniqueResults.length} recovery services.`);

    return new Response(JSON.stringify({
      resources: uniqueResults,
      cached: false
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Search error:', errorMessage);
    return new Response(JSON.stringify({
      error: errorMessage
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

// Helper functions
function parseAddress(formattedAddress: string): string {
  const parts = formattedAddress.split(',');
  if (parts.length < 2) return formattedAddress;
  // Return street address + city only
  return `${parts[0].trim()}, ${parts[1].trim()}`;
}

function categorizePlace(placeTypes: string[]): string[] {
  const categories = [];

  // Recovery service categorization based on place types
  if (placeTypes.includes('contractor') || placeTypes.includes('roofing_contractor')) {
    categories.push('contractor');
  }
  if (placeTypes.includes('painter')) {
    categories.push('painter');
  }
  if (placeTypes.includes('plumber')) {
    categories.push('plumber');
  }
  if (placeTypes.includes('electrician')) {
    categories.push('electrician');
  }
  if (placeTypes.includes('moving_company') || placeTypes.includes('car_rental')) {
    categories.push('moving');
  }
  if (placeTypes.includes('hardware_store') || placeTypes.includes('home_goods_store')) {
    categories.push('tools');
  }
  if (placeTypes.includes('self_storage')) {
    categories.push('moving');
  }
  
  return categories;
}

function removeDuplicates(resources: any[]): any[] {
  const unique = [];
  const seen = new Set();

  for (const resource of resources) {
    const key = `${resource.name.toLowerCase()}_${Math.round(resource.latitude || 0)}_${Math.round(resource.longitude || 0)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(resource);
    }
  }

  return unique;
}