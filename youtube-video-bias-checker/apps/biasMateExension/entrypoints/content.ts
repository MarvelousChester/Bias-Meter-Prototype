export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  main() {
    console.log('Bias Mate: Content script loaded on YouTube');
  },
});
