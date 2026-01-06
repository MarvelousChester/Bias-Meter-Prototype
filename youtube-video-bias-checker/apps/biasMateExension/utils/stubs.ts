import { supabase } from "@/lib/supabase";

export function extractVideoID(url: string): string | null {
    console.log("Stub: Extracting video ID from", url);
    return "mock-video-id";
}

export async function fetchTranscript(videoId: string): Promise<string> {
    console.log("Stub: Fetching transcript for", videoId);
    return "This is a mock transcript for testing purposes.";
}

export async function analyzeTranscript(transcript: string): Promise<any> {
    // Get the current session to include the auth token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        throw new Error("No active session. Please log in via the extension popup.");
    }

    const { data, error } = await supabase.functions.invoke('analyze-transcript-gemini', {
        body: { transcript: transcript },
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
