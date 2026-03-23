const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FASHN_API_KEY = Deno.env.get('FASHN_API_KEY');
    if (!FASHN_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { model_image, garment_image, category = 'auto' } = await req.json();

    if (!model_image || !garment_image) {
      return new Response(JSON.stringify({ error: 'Missing model_image or garment_image' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const runRes = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FASHN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_name: 'tryon-v1.6',
        inputs: {
          model_image,
          garment_image,
          category,
          mode: 'balanced',
        },
      }),
    });

    const runText = await runRes.text();
    console.log('fashn.ai /run response:', runRes.status, runText);

    if (!runRes.ok) {
      return new Response(JSON.stringify({ error: `fashn.ai error: ${runText}` }), {
        status: runRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let runData: { id?: string };
    try {
      runData = JSON.parse(runText);
    } catch {
      return new Response(JSON.stringify({ error: `Invalid JSON from fashn.ai: ${runText}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!runData.id) {
      return new Response(JSON.stringify({ error: 'No job ID returned from fashn.ai' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ id: runData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
