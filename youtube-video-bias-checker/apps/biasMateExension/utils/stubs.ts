export function extractVideoID(url: string): string | null {
    console.log("Stub: Extracting video ID from", url);
    return "mock-video-id";
}

export async function fetchTranscript(videoId: string): Promise<string> {
    console.log("Stub: Fetching transcript for", videoId);
    return "This is a mock transcript for testing purposes.";
}

export async function analyzeTranscript(transcript: string): Promise<any> {
    console.log("Stub: Analyzing transcript");
    return {
        political_leaning: "center",
        political_philosophies: ["Pragmatism", "Centrism"],
        summary_and_analysis: "This is a **mock analysis**. The content appears to be balanced."
    };
}
