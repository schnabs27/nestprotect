import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DisasterResource {
  name: string;
  address: string;
  phone: string | null;
  description: string;
  url: string;
  zipCode: string;
  geolocation: { lat: number; lng: number } | null;
  categories: string[];
  source: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipCode } = await req.json();
    console.log(`Starting search for ZIP code: ${zipCode}`);
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log(`OpenAI API key found: ${openaiApiKey ? 'Yes' : 'No'}`);

    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Validate ZIP code format
    if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
      console.error(`Invalid ZIP code format: ${zipCode}`);
      return new Response(
        JSON.stringify({ error: 'Invalid ZIP code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calling searchOpenAI function for ZIP: ${zipCode}`);
    const results = await searchOpenAI(zipCode, openaiApiKey);
    console.log(`SearchOpenAI returned ${results.length} results`);

    return new Response(
      JSON.stringify({ 
        zipCode,
        results: results.map(resource => ({
          id: `openai-${Date.now()}-${Math.random()}`,
          name: resource.name,
          address: resource.address,
          phone: resource.phone,
          description: resource.description,
          website: resource.url,
          postal_code: resource.zipCode,
          latitude: resource.geolocation?.lat || null,
          longitude: resource.geolocation?.lng || null,
          category: resource.categories.join(', '),
          source: 'openai',
          source_id: null,
          distance_mi: null,
          city: null,
          state: null,
          hours: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_verified_at: null,
          last_seen_at: new Date().toISOString(),
          is_archived: false
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-openai-resources function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// OpenAI search function  
async function searchOpenAI(requestedZipcode: string, openaiApiKey: string): Promise<DisasterResource[]> {
  const prompt = `You are a disaster response resource expert. Generate a list of realistic emergency and disaster response resources that would typically be available in ZIP code ${requestedZipcode}.

Based on your knowledge of emergency infrastructure, create resources that would realistically exist in this area. Include:

CATEGORIES to include:
- emergency responder (police, fire station)
- emergency medical (urgent care, emergency room, hospitals)
- emergency shelter (community centers, schools that serve as shelters)
- disaster relief food assistance (food banks, community kitchens)
- community center
- local government disaster resources

For ZIP code ${requestedZipcode}, generate 3-8 realistic resources that would typically be found in this area.

IMPORTANT OUTPUT FORMAT - Return ONLY valid JSON:
{
  "zipCode": "${requestedZipcode}",
  "results": [
    {
      "name": "Resource Name",
      "address": "Street Address, City",
      "phone": "Phone number or null",
      "description": "Brief description of services (max 280 chars)",
      "url": "https://example.gov/resource-page",
      "zipCode": "${requestedZipcode}",
      "geolocation": {"lat": 40.123, "lng": -74.456} or null,
      "categories": ["emergency_medical", "emergency_shelter"]
    }
  ]
}

Generate realistic resources for ZIP code ${requestedZipcode}. Return ONLY the JSON object, no additional text.`;

  try {
    console.log(`Making OpenAI API call for ZIP: ${requestedZipcode}`);
    console.log(`API key length: ${openaiApiKey.length}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 2000
      })
    });

    console.log(`OpenAI API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`OpenAI response data:`, JSON.stringify(data, null, 2));
    
    const content = data.choices[0]?.message?.content;
    console.log(`OpenAI content: ${content?.substring(0, 500)}...`);

    if (!content) {
      console.log('No content in OpenAI response');
      return [];
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('No JSON found in OpenAI response');
      return [];
    }

    console.log(`JSON match found: ${jsonMatch[0].substring(0, 200)}...`);
    const parsedResponse = JSON.parse(jsonMatch[0]);
    console.log(`Parsed response:`, parsedResponse);
    
    const results = parsedResponse.results.map((result: any) => ({
      ...result,
      source: 'openai'
    }));
    
    console.log(`Returning ${results.length} results`);
    return results;

  } catch (error) {
    console.error('OpenAI search error:', error);
    console.error('Error stack:', error.stack);
    return [];
  }
}