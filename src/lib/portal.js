/**
 * Turns a GeoHub application URL into one served through this portal's proxy.
 *
 * The applications cannot be framed directly: they are privately shared, so an
 * iframe pointed at gh.space.gov.rw has no way to authenticate — a cross-origin
 * frame is sealed to us. Routing through /api/portal/gh makes the frame
 * same-origin, and the server attaches the signed-in user's portal token.
 */
export const PORTAL_ORIGIN = 'https://gh.space.gov.rw/portal'
export const PROXY_BASE = '/api/portal/gh'

export function embedUrl(url) {
  if (typeof url !== 'string' || !url.startsWith(PORTAL_ORIGIN)) return url
  return PROXY_BASE + url.slice(PORTAL_ORIGIN.length)
}
