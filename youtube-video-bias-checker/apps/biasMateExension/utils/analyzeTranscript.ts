import { supabase } from "@/lib/supabase";
import type { AnalysisResponse, VideoMetadata } from "@bias-mate/shared";

export async function analyzeTranscript(transcript: string, videoMetadata: VideoMetadata): Promise<AnalysisResponse> {
    // Get the current session to include the auth token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        throw new Error("No active session. Please log in via the extension popup.");
    }

    const { data, error } = await supabase.functions.invoke('analyze-transcript-gemini', {
        body: { transcript, videoMetadata },
        headers: {
            Authorization: `Bearer ${session.access_token}`
        }
    });
    
    if (error) {
        console.error("Script Analysis Failed:", error);
        throw new Error(`Supabase function error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
        throw new Error("Supabase function returned no data");
    }
    
    console.log("Script Analyzed:", data);
    return data;
}
