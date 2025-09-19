import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requested_zipcode } = await req.json();
    console.log(`Starting Perplexity search for ZIP code: ${requested_zipcode}`);
    
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    console.log(`Perplexity API key found: ${perplexityApiKey ? 'Yes' : 'No'}`);

    if (!perplexityApiKey) {
      console.error('Perplexity API key not configured');
      throw new Error('Perplexity API key not configured');
    }

    // Validate ZIP code format
    if (!requested_zipcode || !/^\d{5}(-\d{4})?$/.test(requested_zipcode)) {
      console.error(`Invalid ZIP code format: ${requested_zipcode}`);
      return new Response(
        JSON.stringify({ error: 'Invalid ZIP code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calling Perplexity API for ZIP: ${requested_zipcode}`);
    const result = await searchPerplexity(requested_zipcode, perplexityApiKey);
    console.log(`Perplexity search completed`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-perplexity-resources function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Perplexity search function
async function searchPerplexity(requestedZipcode: string, perplexityApiKey: string) {
  const prompt = `Find current disaster relief resources for ZIP code ${requestedZipcode}. List only factual information:

**Format each resource as:**
- Organization/Program Name
- Location/Address (if available)
- Contact: Phone/Website
- Services: Brief list only
- Hours/Availability (if available)

**Include only:**
- FEMA assistance centers
- Emergency shelters currently open
- Food distribution sites
- Financial assistance programs
- Medical services for disaster victims

**Exclude:**
- General descriptions
- Background information
- Commentary or analysis

Focus on resources announced in official press releases and news within the past 60 days.`;

  try {
    console.log(`Making Perplexity API call for ZIP: ${requestedZipcode}`);
    console.log(`API key length: ${perplexityApiKey.length}`);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'Provide only factual listings of disaster relief resources. No commentary or descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        top_p: 0.7,
        max_tokens: 800,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ["gov", "org", "edu"],
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      })
    });

    console.log(`Perplexity API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: ${response.status} - ${errorText}`);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Perplexity response data:`, JSON.stringify(data, null, 2));
    
    const answer = data.choices[0]?.message?.content;
    const search_results = data.citations || [];

    console.log(`Perplexity answer: ${answer?.substring(0, 500)}...`);
    console.log(`Search results count: ${search_results.length}`);

    if (!answer) {
      console.log('No answer in Perplexity response');
      return {
        answer: 'No disaster relief resources found for this ZIP code.',
        search_results: []
      };
    }

    return {
      answer,
      search_results: search_results.map((citation: any) => ({
        title: citation.title || 'Source',
        url: citation.url || '',
        date: citation.date || ''
      }))
    };

  } catch (error) {
    console.error('Perplexity search error:', error);
    console.error('Error stack:', error.stack);
    return {
      answer: 'Unable to search for disaster relief resources at this time. Please try again later.',
      search_results: []
    };
  }
}