/**
 * YouTube video-related types
 */

export interface VideoMetadata {
  videoId: string;
  title: string;
  channelName: string;
  uploadDate: string;
}

export interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}
