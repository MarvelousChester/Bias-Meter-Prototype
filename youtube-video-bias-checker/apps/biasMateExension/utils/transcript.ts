import { YoutubeTranscript } from 'youtube-transcript-plus';
import type { TranscriptItem } from '@bias-mate/shared';

export type { TranscriptItem };

/**
 * Fetch and parse the transcript for a given YouTube video ID using youtube-transcript-plus
 */
export async function getTranscript(videoId: string): Promise<TranscriptItem[] | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      throw new Error("Transcript is empty or null");
    }

    // Map library output to our interface
    // The library usually returns { text: string, duration: number, offset: number }
    return transcript.map((item: any) => ({
      text: item.text,
      start: item.offset,
      duration: item.duration,
    }));
  } catch (error) {
    console.error('Bias Mate: Error fetching transcript with youtube-transcript-plus, falling back to Python API', error);
    
    try {
      const response = await fetch(`http://localhost:5328/api/python/${videoId}`);
      if (!response.ok) {
        console.error(`Bias Mate: Fallback Python API failed with status ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      if (data.transcript) {
        // BiasDetector concatenates text from items, so returning a single block is sufficient
        return [{
          text: data.transcript,
          start: 0,
          duration: 0
        }];
      }
      return null;
    } catch (fallbackError) {
      console.error('Bias Mate: Fallback Python API also failed', fallbackError);
      return null;
    }
  }
}
