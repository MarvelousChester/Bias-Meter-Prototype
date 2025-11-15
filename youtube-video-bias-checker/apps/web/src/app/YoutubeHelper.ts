// Generate to take video ID from URL

export function extractVideoID(url: string): string | null {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Call FastAPI get_transcript endpoint
//TODO: Encode the videoId to be URL safe and decode in FastAPI
export async function fetchTranscript(videoId: string): Promise<string> {
  const response = await fetch(`/api/python/${videoId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch transcript");
  }
  const data = await response.json();
  return data.transcript;
}
