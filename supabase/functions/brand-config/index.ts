import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-brand-api-key',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const brandApiKey = req.headers.get('x-brand-api-key')
    if (!brandApiKey) {
      return new Response(JSON.stringify({ error: 'Missing x-brand-api-key header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: brand, error } = await supabase
      .from('brands')
      .select('id, name, widget_theme, allowed_domains, is_active')
      .eq('api_key', brandApiKey)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !brand) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive brand API key' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate origin against allowed_domains if any are set
    const origin = req.headers.get('origin') || ''
    if (brand.allowed_domains && brand.allowed_domains.length > 0) {
      const originHost = (() => {
        try { return new URL(origin).hostname } catch { return '' }
      })()
      const allowed = brand.allowed_domains.some((d: string) =>
        originHost === d || originHost.endsWith('.' + d)
      )
      if (!allowed) {
        return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({
      brand_id: brand.id,
      name: brand.name,
      theme: brand.widget_theme,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
