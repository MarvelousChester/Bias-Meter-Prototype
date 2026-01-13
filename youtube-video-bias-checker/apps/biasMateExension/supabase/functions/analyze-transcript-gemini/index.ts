// Follow this setup guide to integrate the npm package in Deno
// https://supabase.com/docs/guides/functions/import-maps
import { GoogleGenAI } from "npm:@google/genai";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorsHeaders } from "./cors.ts";
import { politicalAnalysisSchema } from "./responseSchema.ts";

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
    // Note: Deno.env.get is used instead of process.env
    const apiKey = Deno.env.get('GEN_AI_API_KEY');
    if (!apiKey) {
      throw new Error("GEN_AI_API_KEY is not set");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Ensure this model name is correct. Common ones are 'gemini-1.5-pro' or 'gemini-1.5-flash'.
    // If you have access to a 2.5 preview, keep it.
    const modelId = "gemini-2.5-pro"; 

    const systemInstruction =
      "You are a neutral, objective political analyst. Your sole task is to analyze the provided transcript for political bias and underlying ideology.";

    const analysisTool = {
      functionDeclarations: [
        {
          name: "record_political_analysis",
          description: "Records the political bias analysis of a given transcript.",
          parameters: politicalAnalysisSchema,
        },
      ],
    };

    const modelConfig = {
      systemInstruction: systemInstruction,
      tools: [analysisTool],
    };

    const prompt = `Please analyze the following transcript and report your findings using the 'record_political_analysis' tool.

    Transcript:
    ---
    ${transcript}
    ---
    `;

    // 4. Execute the call
    // Note: The new SDK syntax might differ slightly depending on version. 
    // This follows the pattern from your snippet.
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ parts: [{ text: prompt }] }],
      config: modelConfig,
    });

    // 5. Parse findings
    let resultData = null;

    // Check for function calls in the response
    // The structure depends on the exact SDK version return type
    if (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        console.log(`Function called: ${functionCall.name}`);
        resultData = functionCall.args;
    } else {
        // Fallback if the model refused to call the function
        console.log("No function call found.");
        resultData = { error: "Model did not trigger analysis tool", raw_text: response.text };
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