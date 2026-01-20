// CORS configuration for Supabase Edge Functions
// Update ALLOWED_ORIGINS with your actual extension ID from chrome://extensions

// Set to true for local development (allows any chrome-extension origin)
// Set to false for production
const DEV_MODE = true;

const ALLOWED_ORIGINS = [
  'chrome-extension://kplbdjphnamhlkmnpmalnalghigoafak',
  'https://www.youtube.com',
  'https://youtube.com',
];

/**
 * Get CORS headers based on the request origin
 * @param origin - The Origin header from the request
 * @returns CORS headers object (empty if origin not allowed)
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  // In development mode, allow any chrome-extension:// origin + YouTube
  const isAllowed = DEV_MODE 
    ? (origin?.startsWith('chrome-extension://') || ALLOWED_ORIGINS.includes(origin ?? ''))
    : origin && ALLOWED_ORIGINS.includes(origin);

  if (isAllowed && origin) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  }

  // Deny unknown origins
  return {};
}