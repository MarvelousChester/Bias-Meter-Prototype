// TODO: Can you use the same library as transcript to get the metadata
import { extractVideoId } from '@bias-mate/shared';

export interface VideoMetadata {
  videoId: string;
  title: string;
  channelName: string;
  uploadDate: string;
}

/**
 * Helper to get text content from a selector
 */
function getText(selector: string): string | null {
  const element = document.querySelector(selector);
  return element?.textContent?.trim() || null;
}

/**
 * Helper to get attribute value from a selector
 */
function getAttribute(selector: string, attribute: string): string | null {
  const element = document.querySelector(selector);
  return element?.getAttribute(attribute) || null;
}

export function extractVideoMetadata(): VideoMetadata | null {
  const url = window.location.href;
  const videoId = extractVideoId(url);

  if (!videoId) {
    return null;
  }

  // extract title
  // Try h1 in metadata first, fallback to generic h1 or meta tag
  const title =
    getText('ytd-watch-metadata h1') ||
    getText('#title h1') ||
    getAttribute('meta[name="title"]', 'content') ||
    'Unknown Title';

  // extract channel name
  // Try the main channel name link
  const channelName =
    getText('ytd-channel-name #text a') ||
    getText('#upload-info #channel-name a') ||
    getAttribute('link[itemprop="name"]', 'content') ||
    'Unknown Channel';

  // extract upload date
  // Try the visible date string, fallback to meta tag
  const uploadDate =
    getAttribute('meta[itemprop="datePublished"]', 'content') ||
    getText('#info-strings yt-formatted-string') ||
    'Unknown Date';

  return {
    videoId,
    title,
    channelName,
    uploadDate,
  };
}
