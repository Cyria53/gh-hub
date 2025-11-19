import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Starting carte grise OCR extraction...');

    // Appel à Lovable AI (Google Gemini Vision) pour OCR
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en extraction OCR de cartes grises françaises. Analyse l'image et extrait UNIQUEMENT les informations suivantes au format JSON strict :
{
  "license_plate": "string (champ A)",
  "first_registration_date": "YYYY-MM-DD (champ B)",
  "brand": "string (champ D.1)",
  "model": "string (champ D.3)",
  "vin": "string 17 caractères (champ E)",
  "fuel_type": "string (champ P.3 - essence/diesel/electrique/hybride/gpl)",
  "color": "string (champ Y.1)",
  "year": "number (année de B)"
}

RÈGLES STRICTES:
- Retourne UNIQUEMENT le JSON, rien d'autre
- Si un champ n'est pas visible, utilise null
- Pour fuel_type, normalise en: essence, diesel, electrique, hybride, ou gpl
- Pour first_registration_date, format YYYY-MM-DD
- Pour year, extrait l'année de la date B
- Vérifie que le VIN fait bien 17 caractères`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extrait les données de cette carte grise française:"
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData // base64 data:image/...
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants." 
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Crédits Lovable AI insuffisants. Veuillez recharger votre compte." 
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content;

    if (!extractedText) {
      throw new Error('No content extracted from AI response');
    }

    console.log('Raw AI response:', extractedText);

    // Parser le JSON de la réponse
    let extractedData;
    try {
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      extractedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse extracted data as JSON');
    }

    // Validation basique
    if (!extractedData.license_plate && !extractedData.vin && !extractedData.brand) {
      throw new Error('No relevant data could be extracted from the image');
    }

    // Nettoyer et valider les données
    const cleanedData = {
      license_plate: extractedData.license_plate?.toUpperCase() || null,
      first_registration_date: extractedData.first_registration_date || null,
      brand: extractedData.brand || null,
      model: extractedData.model || null,
      vin: extractedData.vin?.toUpperCase().slice(0, 17) || null,
      fuel_type: extractedData.fuel_type?.toLowerCase() || null,
      color: extractedData.color || null,
      year: extractedData.year || (extractedData.first_registration_date ? 
        new Date(extractedData.first_registration_date).getFullYear() : null),
    };

    console.log('Cleaned extracted data:', cleanedData);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: cleanedData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in carte-grise-ocr function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
