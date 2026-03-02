// Follow this setup guide to integrate the npm package in Deno
// https://supabase.com/docs/guides/functions/import-maps
import { GoogleGenAI } from "npm:@google/genai";
import { createClient } from "npm:@supabase/supabase-js@2";
import { load as cheerioLoad } from "npm:cheerio";
import { getCorsHeaders } from "./cors.ts";
import { createModelConfig, politicalAnalysisConfig, politicalDetectionConfig } from "./promptConfig.ts";

// =========================================================================
// Ebsco Definition Scraping (for missing political terms)
// =========================================================================

const EBSCO_URL_TEMPLATES = [
  "https://www.ebsco.com/research-starters/diplomacy-and-international-relations/{keyword}",
  "https://www.ebsco.com/research-starters/political-science/{keyword}",
  "https://www.ebsco.com/research-starters/history/{keyword}",
  "https://www.ebsco.com/research-starters/psychology/{keyword}",
  "https://www.ebsco.com/research-starters/literature-and-writing/{keyword}",
];

const EBSCO_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

const EBSCO_TIMEOUT_MS = 10_000;

async function fetchEbscoDefinition(
  keyword: string
): Promise<{ term: string; definition: string; source_url: string } | null> {
  const normalizedKey = keyword.trim().toLowerCase();
  if (!normalizedKey) return null;
  const slug = normalizedKey.replace(/\s+/g, "-");
  for (const template of EBSCO_URL_TEMPLATES) {
    const url = template.replace("{keyword}", encodeURIComponent(slug));

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), EBSCO_TIMEOUT_MS);

      const res = await fetch(url, {
        headers: { "User-Agent": EBSCO_USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerioLoad(html);
      const heading = $("h1#research-starter-title").first();
      if (!heading.length) continue;

      // Find the next sibling div after the heading
      const nextDiv = heading.nextAll("div").first();
      if (!nextDiv.length) continue;

      const firstParagraph = nextDiv.find("p").first();
      const definition = firstParagraph.text().trim();
      if (definition) {
        return { term: keyword.trim(), definition, source_url: url };
      }
    } catch (err) {
      console.error(`Ebsco scrape error for ${url}:`, err);
    }
  }

  return null;
}

// =========================================================================
// Gemini Helper
// =========================================================================

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

// =========================================================================
// Database Persistence
// =========================================================================

interface VideoMetadataInput {
  videoId: string;
  title: string;
  channelName: string;
  uploadDate: string;
}

interface AnalysisData {
  political_leaning: string;
  political_philosophies: { term: string; modifier?: string }[];
  summary_and_analysis: string;
}

async function persistAnalysisResults(
  serviceClient: ReturnType<typeof createClient>,
  videoMetadata: VideoMetadataInput,
  analysisData: AnalysisData
): Promise<void> {
  try {
    // 1. Upsert video_metadata
    const { error: videoError } = await serviceClient
      .from("video_metadata")
      .upsert(
        {
          video_id: videoMetadata.videoId,
          title: videoMetadata.title,
          channel_name: videoMetadata.channelName,
          upload_date: videoMetadata.uploadDate,
        },
        { onConflict: "video_id" }
      );

    if (videoError) {
      console.error("Failed to upsert video_metadata:", videoError);
      return; // Can't proceed without video_metadata due to FK
    }
    console.log(`Upserted video_metadata for ${videoMetadata.videoId}`);

    // 2. Insert political_analysis
    // Map the leaning value to the DB enum (lowercase)
    const leaningMap: Record<string, string> = {
      "Left": "left",
      "Left-leaning": "left-leaning",
      "Center": "center",
      "Right-leaning": "right-leaning",
      "Right": "right",
    };
    const dbLeaning = leaningMap[analysisData.political_leaning] || "center";

    const { data: analysisRow, error: analysisError } = await serviceClient
      .from("political_analysis")
      .upsert({
        video_id: videoMetadata.videoId,
        political_leaning: dbLeaning,
        summary_and_analysis: analysisData.summary_and_analysis,
      }, { onConflict: "video_id" })
      .select("video_id")
      .single();

    if (analysisError || !analysisRow) {
      console.error("Failed to upsert political_analysis:", analysisError);
      return;
    }
    const analysisVideoId = analysisRow.video_id;
    console.log(`Upserted political_analysis for video_id: ${analysisVideoId}`);

    // 3. For each political philosophy, look up or create the term, then link it
    if (!analysisData.political_philosophies?.length) return;

    for (const philosophyObj of analysisData.political_philosophies) {
      const philosophy = philosophyObj.term;
      const modifier = philosophyObj.modifier || null;
      try {
        // Try to find the term in political_terms (case-insensitive)
        const { data: existingTerm, error: lookupError } = await serviceClient
          .from("political_terms")
          .select("id")
          .ilike("term", philosophy.trim())
          .maybeSingle();

        let termId: number;

        if (lookupError) {
          console.error(`Error looking up term "${philosophy}":`, lookupError);
          continue;
        }

        if (existingTerm) {
          termId = existingTerm.id;
        } else {
          // Term not found — fetch definition from Ebsco
          console.log(`Term "${philosophy}" not found in DB. Fetching from Ebsco...`);
          const ebscoResult = await fetchEbscoDefinition(philosophy);

          const termToInsert = ebscoResult
            ? { term: ebscoResult.term, definition: ebscoResult.definition, source_url: ebscoResult.source_url }
            : { term: philosophy.trim(), definition: "Definition not found.", source_url: "" };

          const { data: newTerm, error: insertTermError } = await serviceClient
            .from("political_terms")
            .insert(termToInsert)
            .select("id")
            .single();

          if (insertTermError || !newTerm) {
            console.error(`Failed to insert term "${philosophy}":`, insertTermError);
            continue;
          }
          termId = newTerm.id;
          console.log(`Inserted new political_term "${philosophy}" with id: ${termId}`);
        }

        // 4. Upsert into political_analysis_terms junction table
        const { error: junctionError } = await serviceClient
          .from("political_analysis_terms")
          .upsert({
            video_id: analysisVideoId,
            term_id: termId,
            modifier: modifier,
          }, { onConflict: "video_id, term_id" });

        if (junctionError) {
          console.error(`Failed to link term "${philosophy}" to analysis:`, junctionError);
        }
      } catch (termErr) {
        console.error(`Error processing term "${philosophy}":`, termErr);
      }
    }

    console.log("Analysis results persisted successfully.");
  } catch (err) {
    console.error("Error persisting analysis results:", err);
  }
}

// =========================================================================
// Main Handler
// =========================================================================

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

    // Create a service-role client for DB writes (bypasses RLS)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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
    const { transcript, videoMetadata } = await req.json();

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

      // =====================================================================
      // STEP 3: Persist analysis results to database
      // =====================================================================
      if (videoMetadata) {
        console.log("Step 3: Persisting analysis results to database...");
        await persistAnalysisResults(
          serviceClient,
          videoMetadata as VideoMetadataInput,
          analysisResult.data as unknown as AnalysisData
        );
      } else {
        console.log("Step 3: Skipped — no videoMetadata provided.");
      }
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