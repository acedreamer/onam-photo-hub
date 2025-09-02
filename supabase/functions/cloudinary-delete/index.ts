import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Cloudinary delete function invoked.");
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
    
    // Generate signature using Web Crypto API
    const paramsToSign = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', encodedData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

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
      console.error("Cloudinary delete API error:", errorText);
      throw new Error(`Cloudinary deletion failed: ${response.status} ${errorText}`);
    }

    const responseData: any = await response.json();

    if (responseData.result !== 'ok' && responseData.result !== 'not found') {
        throw new Error(`Cloudinary deletion failed with result: ${responseData.result}`);
    }

    return new Response(JSON.stringify({ success: true, result: responseData.result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in Cloudinary delete function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});