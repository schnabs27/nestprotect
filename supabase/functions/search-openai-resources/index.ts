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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Validate ZIP code format
    if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ZIP code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = await searchOpenAI(zipCode, openaiApiKey);

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
  const prompt = `You are a natural disaster response expert. Your task is to scan the provided source material (news articles, press releases, city/county/state pages, utility outage/announcement pages, Red Cross updates, reputable .org sites) and return PERMANENT, TEMPORARY or ANNOUNCED disaster-response resources that supplement Google Maps Places (New) for the given ZIP code.

You do not need to filter out Google Maps Places (New) listings. Focus especially on pop-up/temporary sites (e.g., warming/cooling centers, disaster recovery centers, mobile clinics, food distribution pop-ups, animal shelters/vet triage, utility outage support locations).

RULES
1) ZIP filter:
   - Include ONLY resources whose service location ZIP EXACTLY equals ${requestedZipcode}. If a page lists multiple sites, include only the entries with this exact ZIP.
   - If ZIP is not explicitly shown but the street + city clearly resolves to the same ZIP per the source text, include it; otherwise omit.

2) Category filter:
   - emergency responder (police, fire station)
   - emergency medical (urgent care, emergency room)
   - emergency shelter
   - disaster relief food assistance
   - community center
   - local government disaster resources (fema)

3) Output fields (no hallucinations):
   - name: String (resource/site/organization name as shown).
   - address: String = "street, city" ONLY (no state, zip, country). If city missing, use street only; if street missing, omit.
   - phone: String or null (prefer official number in the source).
   - description: ≤280 chars, plain text summary of WHAT the service is and FOR WHOM it is intended. IMPORTANT: exclude WHEN (timing/schedule) details, and remove the resource/organization name if it appears; collapse extra spaces.
   - url: String = the SOURCE page URL you used (news/press/.gov/.org/utility page).
   - zipCode: String = the 5-digit ZIP code of the resource.
   - geolocation: { "lat": number, "lng": number } if present in source; else null.
   - categories: list all category filter labels applicable to the record

4) Evidence and conservatism:
   - Prefer official sources (city/county/state .gov, utility domains, Red Cross) and reputable local media.
   - If start/end dates are listed and clearly expired, exclude.
   - If category uncertain, leave booleans false.

5) Output format:
   - Return ONE strict JSON object:
     {
       "zipCode": "${requestedZipcode}",
       "results": [ ...matching resources... ]
     }
   - If no matches: {"zipCode":"${requestedZipcode}","results":[]}
   - Strict JSON only. No extra text/markdown.

Please search for current disaster response resources in ZIP code ${requestedZipcode}.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return [];
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return [];
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    return parsedResponse.results.map((result: any) => ({
      ...result,
      source: 'openai'
    }));

  } catch (error) {
    console.error('OpenAI search error:', error);
    return [];
  }
}