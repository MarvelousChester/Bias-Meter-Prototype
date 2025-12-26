import { extractVideoId } from '@bias-mate/shared';
import { extractVideoMetadata } from '../utils/videoMetadata';
import { getTranscript } from '../utils/transcript';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  main() {
    // Function to attempt extraction
    const logMetadata = async () => {
      const metadata = extractVideoMetadata();
      if (metadata) {
        console.log('Bias Mate: Video Metadata Detected:', metadata);
        
        // Fetch transcript if id is present
        console.log('Bias Mate: Fetching transcript...');
        const transcript = await getTranscript(metadata.videoId);
        if (transcript) {
           console.log('Bias Mate: Transcript Extracted:', transcript.slice(0, 5), `... (${transcript.length} items)`);
        } else {
           console.log('Bias Mate: No transcript found.');
        }

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
