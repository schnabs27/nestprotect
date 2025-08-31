import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FirePoint {
  latitude: number;
  longitude: number;
  confidence: number;
  acq_date: string;
  acq_time: string;
  bright_ti4: number;
  bright_ti5: number;
  frp: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipCode } = await req.json();
    
    if (!zipCode) {
      return new Response(
        JSON.stringify({ error: 'Zip code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get coordinates from zip code using OpenWeather geocoding
    const openWeatherKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!openWeatherKey) {
      console.error('OPENWEATHER_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Geocoding API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},US&appid=${openWeatherKey}`
    );

    if (!geoResponse.ok) {
      console.error('Geocoding API error:', await geoResponse.text());
      return new Response(
        JSON.stringify({ error: 'Invalid zip code or geocoding failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geoData = await geoResponse.json();
    const { lat, lon } = geoData;

    // Calculate bounding box for 10-mile radius (approximately 0.145 degrees)
    const radiusDegrees = 0.145;
    const minLat = lat - radiusDegrees;
    const maxLat = lat + radiusDegrees;
    const minLon = lon - radiusDegrees;
    const maxLon = lon + radiusDegrees;

    // Get current date for NASA FIRMS API
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // NASA FIRMS API endpoint for MODIS data
    const nasaApiKey = Deno.env.get('NASAFIRMS_API_KEY');
    if (!nasaApiKey) {
      console.error('NASAFIRMS_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Fire data API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${nasaApiKey}/MODIS_NRT/${minLon},${minLat},${maxLon},${maxLat}/1/${dateStr}`;

    console.log('Fetching fire data from:', firmsUrl);

    const fireResponse = await fetch(firmsUrl);

    if (!fireResponse.ok) {
      console.error('NASA FIRMS API error:', fireResponse.status, await fireResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch fire data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const csvData = await fireResponse.text();
    
    // Parse CSV data
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) {
      // No fire data (just header or empty)
      return new Response(
        JSON.stringify({
          fires: [],
          alertLevel: 'none',
          totalFires: 0,
          highConfidenceFires: 0,
          timestamp: Date.now(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const headers = lines[0].split(',');
    const fires: FirePoint[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= headers.length) {
        fires.push({
          latitude: parseFloat(values[0]),
          longitude: parseFloat(values[1]),
          confidence: parseFloat(values[8]) || 0,
          acq_date: values[5],
          acq_time: values[6],
          bright_ti4: parseFloat(values[2]) || 0,
          bright_ti5: parseFloat(values[3]) || 0,
          frp: parseFloat(values[4]) || 0,
        });
      }
    }

    // Calculate alert level based on fire activity
    const highConfidenceFires = fires.filter(fire => fire.confidence >= 80).length;
    const totalFires = fires.length;

    let alertLevel = 'none';
    if (totalFires > 0) {
      if (highConfidenceFires >= 3) {
        alertLevel = 'high';
      } else if (totalFires >= 2) {
        alertLevel = 'medium';
      } else {
        alertLevel = 'low';
      }
    }

    const processedData = {
      fires: fires.map(fire => ({
        lat: fire.latitude,
        lon: fire.longitude,
        confidence: fire.confidence,
        date: fire.acq_date,
        time: fire.acq_time,
        brightness: fire.bright_ti4,
        frp: fire.frp,
      })),
      alertLevel,
      totalFires,
      highConfidenceFires,
      timestamp: Date.now(),
    };

    console.log(`Found ${totalFires} fires, ${highConfidenceFires} high confidence, alert level: ${alertLevel}`);

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-fire-data function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});