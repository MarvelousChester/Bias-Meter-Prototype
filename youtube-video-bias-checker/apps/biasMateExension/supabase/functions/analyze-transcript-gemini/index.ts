// Follow this setup guide to integrate the npm package in Deno
// https://supabase.com/docs/guides/functions/import-maps
import { GoogleGenAI } from "npm:@google/genai";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders } from "./cors.ts";
import { createModelConfig, politicalAnalysisConfig, politicalDetectionConfig } from "./promptConfig.ts";

// Helper function to execute Gemini call and parse function response
async function executeGeminiCall(
  ai: InstanceType<typeof GoogleGenAI>,
  modelId: string,
  modelConfig: Record<string, unknown>,
  prompt: string
): Promise<{ success: boolean; data: Record<string, unknown> | null; error?: string }> {
  const response = await ai.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: prompt }] }],
    config: modelConfig,
  });

  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0];
    console.log(`Function called: ${functionCall.name}`);
    return { success: true, data: functionCall.args as Record<string, unknown> };
  } else {
    console.log("No function call found.");
    return { success: false, data: null, error: response.text };
  }
}

Deno.serve(async (req) => {
  // Get origin for CORS
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // 1. Handle CORS (Browser pre-flight requests)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Check if origin is allowed (corsHeaders will be empty if denied)
  if (Object.keys(corsHeaders).length === 0) {
    return new Response(
      JSON.stringify({ error: 'Origin not allowed' }),
      { status: 403 }
    );
  }

  try {
    // 2. Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create Supabase client with user's auth context (enables RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const token = authHeader.replace('Bearer ', '');
    console.log(`Token received (first 20 chars): ${token.substring(0, 20)}...`);
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired token', 
          code: userError?.code,
          message: userError?.message,
          details: JSON.stringify(userError)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Authenticated user: ${user.id} (${user.email})`);

    // 3. Parse the request body
    const { transcript } = await req.json();

    if (!transcript) {
      throw new Error("Missing 'transcript' in request body");
    }

    // 4. Initialize Gemini Client
    const apiKey = Deno.env.get('GEN_AI_API_KEY');
    if (!apiKey) {
      throw new Error("GEN_AI_API_KEY is not set");
    }

    const ai = new GoogleGenAI({ apiKey });

    // =========================================================================
    // STEP 1: Political Detection (Guard Rail)
    // =========================================================================
    const detectionConfig = createModelConfig(politicalDetectionConfig);
    const detectionPrompt = `Please analyze the following transcript and determine if it contains political content using the 'record_political_detection' tool.

    Transcript:
    ---
    ${transcript}
    ---
    `;

    console.log("Step 1: Running political detection...");
    const detectionResult = await executeGeminiCall(
      ai,
      detectionConfig.modelId,
      detectionConfig.config,
      detectionPrompt
    );

    if (!detectionResult.success || !detectionResult.data) {
      return new Response(
        JSON.stringify({ 
          error: "Political detection failed", 
          details: detectionResult.error 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const detectionData = detectionResult.data as { 
      is_political: boolean; 
      confidence: string; 
      reasoning: string; 
    };
    
    console.log(`Detection result: is_political=${detectionData.is_political}, confidence=${detectionData.confidence}`);

    // If not political, return early with detection result
    if (!detectionData.is_political) {
      console.log("Content is not political. Skipping bias analysis.");
      return new Response(
        JSON.stringify({
          is_political: false,
          detection: detectionData,
          analysis: null,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // =========================================================================
    // STEP 2: Full Political Bias Analysis (only if political)
    // =========================================================================
    console.log("Step 2: Content is political. Running bias analysis...");
    
    const analysisConfig = createModelConfig(politicalAnalysisConfig);
    const analysisPrompt = `Please analyze the following transcript and report your findings using the 'record_political_analysis' tool.

    Transcript:
    ---
    ${transcript}
    ---
    `;

    const analysisResult = await executeGeminiCall(
      ai,
      analysisConfig.modelId,
      analysisConfig.config,
      analysisPrompt
    );

    let resultData;
    if (analysisResult.success && analysisResult.data) {
      resultData = {
        is_political: true,
        detection: detectionData,
        analysis: analysisResult.data,
      };
    } else {
      resultData = { 
        is_political: true,
        detection: detectionData,
        analysis: null,
        error: "Model did not trigger analysis tool", 
        raw_text: analysisResult.error 
      };
    }

    // 6. Return JSON response
    return new Response(JSON.stringify(resultData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});