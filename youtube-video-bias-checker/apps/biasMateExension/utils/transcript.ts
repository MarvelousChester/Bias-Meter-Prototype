// TODO: Current Issue is that it seems to prevent the actual transcripts from loading
//      Find another way to get the transcripts from the page later (AI Agent Ignore This)

import { YoutubeTranscript } from 'youtube-transcript-plus';

export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

/**
 * Fetch and parse the transcript for a given YouTube video ID using youtube-transcript-plus
 */
export async function getTranscript(videoId: string): Promise<TranscriptItem[] | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return null;
    }

    // Map library output to our interface
    // The library usually returns { text: string, duration: number, offset: number }
    return transcript.map((item: any) => ({
      text: item.text,
      start: item.offset,
      duration: item.duration,
    }));
  } catch (error) {
    console.error('Bias Mate: Error fetching transcript with youtube-transcript-plus', error);
    return null;
  }
}
