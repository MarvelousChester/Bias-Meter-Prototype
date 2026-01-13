// CORS configuration for Supabase Edge Functions
// Update ALLOWED_ORIGINS with your actual extension ID from chrome://extensions

const ALLOWED_ORIGINS = [
  'chrome-extension://kplbdjphnamhlkmnpmalnalghigoafak',
];

/**
 * Get CORS headers based on the request origin
 * @param origin - The Origin header from the request
 * @returns CORS headers object (empty if origin not allowed)
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  }

  // Deny unknown origins
  return {};
}