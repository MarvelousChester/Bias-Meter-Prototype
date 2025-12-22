// Re-export from shared package for backward compatibility
export { extractVideoId, extractVideoId as extractVideoID } from '@bias-mate/shared';

// Call FastAPI get_transcript endpoint
export async function fetchTranscript(videoId: string): Promise<string> {
  const response = await fetch(`/api/python/${videoId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transcript');
  }
  const data = await response.json();
  return data.transcript;
}
