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
    const { symptomDescription, vehicleInfo } = await req.json();
    
    console.log('Diagnostic AI request:', { symptomDescription, vehicleInfo });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un expert en diagnostic automobile avec 20 ans d'expérience. 
Tu analyses les symptômes de véhicules et fournis des diagnostics précis, des estimations de coûts et des recommandations.

INSTRUCTIONS CRITIQUES:
- Analyse les symptômes décrits avec précision
- Identifie les causes probables par ordre de probabilité
- Évalue la gravité (low, medium, high, critical)
- Fournis une estimation de coût en euros (min et max)
- Donne des recommandations claires et actionnables
- Sois concis mais complet
- Utilise un ton professionnel et rassurant

FORMAT DE RÉPONSE REQUIS (JSON):
{
  "diagnostic": "Description détaillée du diagnostic",
  "severity": "low|medium|high|critical",
  "estimated_cost_min": nombre,
  "estimated_cost_max": nombre,
  "recommendations": "Recommandations et prochaines étapes"
}`;

    const userPrompt = `Véhicule: ${vehicleInfo || 'Non spécifié'}
    
Symptômes rapportés:
${symptomDescription}

Analyse ce problème automobile et fournis un diagnostic complet au format JSON spécifié.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits AI épuisés. Veuillez contacter l'administrateur." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('AI Gateway response:', data);

    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse la réponse JSON de l'IA
    let diagnosticResult;
    try {
      // Essaie d'extraire le JSON de la réponse
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        diagnosticResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback si pas de JSON structuré
        diagnosticResult = {
          diagnostic: aiResponse,
          severity: "medium",
          estimated_cost_min: 50,
          estimated_cost_max: 300,
          recommendations: "Veuillez consulter un mécanicien pour un diagnostic plus précis."
        };
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback
      diagnosticResult = {
        diagnostic: aiResponse,
        severity: "medium",
        estimated_cost_min: 50,
        estimated_cost_max: 300,
        recommendations: "Veuillez consulter un mécanicien pour un diagnostic plus précis."
      };
    }

    return new Response(
      JSON.stringify(diagnosticResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in diagnostic-ai function:', error);
    return new Response(
      JSON.stringify({ 
        error: "Erreur lors de l'analyse du diagnostic",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
