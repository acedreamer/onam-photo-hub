import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Cloudinary upload function invoked.");
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error("No file provided");
    }

    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary credentials are not set in environment variables.");
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'onam-photo-hub';

    // Use Web Crypto API for SHA-1 hashing
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const dataToSign = new TextEncoder().encode(paramsToSign); // Renamed variable here
    const hashBuffer = await crypto.subtle.digest('SHA-1', dataToSign);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('signature', signature);
    uploadFormData.append('folder', folder);
    uploadFormData.append('quality', 'auto:good');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary API error:", errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
    }

    const responseData: any = await response.json(); // Original variable name for response data

    return new Response(
      JSON.stringify({ 
        secure_url: responseData.secure_url,
        public_id: responseData.public_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in Cloudinary upload function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});