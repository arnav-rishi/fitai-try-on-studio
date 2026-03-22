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

    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing job id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const statusRes = await fetch(`https://api.fashn.ai/v1/status/${id}`, {
      headers: { Authorization: `Bearer ${FASHN_API_KEY}` },
    });

    const statusText = await statusRes.text();
    console.log(`fashn.ai /status/${id}:`, statusRes.status, statusText);

    if (!statusRes.ok) {
      return new Response(JSON.stringify({ error: `fashn.ai status error: ${statusText}` }), {
        status: statusRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let statusData: { status?: string; output?: string[]; error?: unknown };
    try {
      statusData = JSON.parse(statusText);
    } catch {
      return new Response(JSON.stringify({ error: `Invalid JSON from fashn.ai: ${statusText}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the full status payload to the client
    return new Response(JSON.stringify(statusData), {
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
