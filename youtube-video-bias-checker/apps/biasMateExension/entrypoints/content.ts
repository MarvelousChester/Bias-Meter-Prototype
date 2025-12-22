import { extractVideoId } from '@bias-mate/shared';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  main() {
    const videoId = extractVideoId(window.location.href);
    if (videoId) {
      console.log('Bias Mate: Video detected:', videoId);
    } else {
      console.log('Bias Mate: Content script loaded on YouTube');
    }
  },
});
