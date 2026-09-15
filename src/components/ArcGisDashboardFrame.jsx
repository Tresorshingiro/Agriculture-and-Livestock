/**
 * The embed.
 *
 * `src` is always a same-origin path produced by `embedUrl` — never a GeoHub
 * address. The applications are privately shared and the portal sends
 * X-Frame-Options, so a cross-origin frame could neither authenticate nor even
 * render; routing through this origin's proxy is what lets one sign-in cover
 * every map.
 *
 * `flex: 1 1 0` (in .app-frame) is what makes the frame take the leftover
 * height of the pane instead of its short intrinsic height.
 */
export default function ArcGisDashboardFrame({ title, src }) {
  return (
    <iframe
      className="app-frame"
      title={title}
      src={src}
      allow="geolocation; microphone; camera; fullscreen"
    />
  )
}
