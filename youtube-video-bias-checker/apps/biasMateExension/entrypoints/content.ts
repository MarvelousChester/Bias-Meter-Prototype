import { extractVideoId } from '@bias-mate/shared';
import { extractVideoMetadata } from '../utils/videoMetadata';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  main() {
    // Function to attempt extraction
    const logMetadata = () => {
      const metadata = extractVideoMetadata();
      if (metadata) {
        console.log('Bias Mate: Video Metadata Detected:', metadata);
      } else {
        console.log('Bias Mate: No video metadata found (yet).');
      }
    };

    // Run initially
    logMetadata();

    // YouTube is an SPA, so we might want to watch for URL changes or specific events.
    // For now, let's just log on load as requested. 
    // A more robust solution for SPA navigation tracking can be added later if needed.
  },
});
