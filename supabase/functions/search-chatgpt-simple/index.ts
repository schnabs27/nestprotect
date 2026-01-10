import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { zip_code } = await req.json();

    if (!zip_code) {
      return new Response(
        JSON.stringify({ error: 'ZIP code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Call OpenAI API with GPT-4o
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an emergency resource locator assisting someone affected by a severe weather event (e.g., flood, hurricane, tornado, wildfire, extreme cold).

Task: Identify temporary disaster relief resources available right now in the user's ZIP code and surrounding county/metro area.

Scope of resources (include ONLY):
* Emergency shelters (temporary only)
* Food distribution / food banks (active relief)
* Medical or urgent care assistance
* Disaster response organizations (e.g., Red Cross, Salvation Army)
* Religious institutions offering disaster relief (not worship or classes)
* Government emergency assistance locations

Exclude:
* Preparedness classes, training, or long-term programs
* General nonprofit directories
* Donation-only pages
* Anything not directly usable by a disaster victim today

Source requirements (MANDATORY):
* Use official websites, local news, county/state emergency pages, or press releases
* Prefer sources updated or referenced within the last 30 days
* If information cannot be verified, DO NOT include it

NO HALLUCINATIONS RULE: If you cannot confirm a resource exists and is relevant to disaster relief in this area, omit it entirely.

OUTPUT FORMAT (Mobile-Friendly)
Provide results in this exact format for each resource:

Category: [Type of Resource]
Name: [Organization Name]
Description: [Clear, actionable help description - 20 words max]
Address: [Street + city or "Multiple locations"]
Contact: [Phone number or website URL]

Geographic Rules:
* Start with the specified ZIP code
* Expand to surrounding county
* Expand to nearest metro area only if needed
* Clearly prefer closer resources

Failure Condition:
If no verified resources are found, return only this sentence and nothing else:
"No temporary disaster relief resources are currently verified for this ZIP code. Try a nearby ZIP?"

Tone & Constraints:
* Neutral, calm, factual
* No emojis
* No assumptions
* No inferred availability
* No speculative language`
          },
          {
            role: 'user',
            content: `Find temporary disaster relief resources available right now in ZIP code ${zip_code}.`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from OpenAI' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await openaiResponse.json();
    const answer = data.choices[0]?.message?.content || 'No response generated';

    return new Response(
      JSON.stringify({ answer }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});