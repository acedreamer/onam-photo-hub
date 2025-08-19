import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || userRole?.role !== 'admin') {
      throw new Error("User is not an admin.");
    }

    const { public_id } = await req.json();
    if (!public_id) {
      throw new Error("No public_id provided for deletion.");
    }

    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary credentials are not set.");
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash('sha1').update(paramsToSign).digest('hex');

    const deleteFormData = new FormData();
    deleteFormData.append('public_id', public_id);
    deleteFormData.append('api_key', apiKey);
    deleteFormData.append('timestamp', timestamp.toString());
    deleteFormData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: deleteFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary deletion failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (data.result !== 'ok' && data.result !== 'not found') {
        throw new Error(`Cloudinary deletion failed with result: ${data.result}`);
    }

    return new Response(JSON.stringify({ success: true, result: data.result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});