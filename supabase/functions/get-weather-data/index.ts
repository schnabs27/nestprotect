import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherResponse {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  };
  alerts?: Array<{
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
  }>;
  hourly: Array<{
    dt: number;
    temp: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number;
  }>;
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

    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!apiKey) {
      console.error('OPENWEATHER_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First get coordinates from zip code
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},US&appid=${apiKey}`
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

    // Get weather data using One Call 3.0 API
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily&units=imperial&appid=${apiKey}`
    );

    if (!weatherResponse.ok) {
      console.error('Weather API error:', await weatherResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch weather data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weatherData: WeatherResponse = await weatherResponse.json();

    // Process 48-hour forecast
    const next48Hours = weatherData.hourly.slice(0, 48);

    const processedData = {
      current: {
        temp: Math.round(weatherData.current.temp),
        feelsLike: Math.round(weatherData.current.feels_like),
        humidity: weatherData.current.humidity,
        windSpeed: Math.round(weatherData.current.wind_speed),
        condition: weatherData.current.weather[0].main,
        description: weatherData.current.weather[0].description,
        icon: weatherData.current.weather[0].icon,
      },
      alerts: weatherData.alerts?.map(alert => ({
        senderName: alert.sender_name,
        event: alert.event,
        start: alert.start,
        end: alert.end,
        description: alert.description,
        tags: alert.tags,
      })) || [],
      forecast48h: next48Hours.map(hour => ({
        time: hour.dt,
        temp: Math.round(hour.temp),
        condition: hour.weather[0].main,
        description: hour.weather[0].description,
        icon: hour.weather[0].icon,
        precipitationChance: Math.round(hour.pop * 100),
      })),
      timestamp: Date.now(),
    };

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-weather-data function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});