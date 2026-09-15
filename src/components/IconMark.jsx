/**
 * The workspace icon set.
 *
 * Inline stroked SVG rather than an icon package: eleven glyphs are not worth a
 * dependency, and inlining means the sidebar paints with the first frame
 * instead of waiting on a font or a sprite sheet.
 */
const PATHS = {
  // Module and solution marks
  parcel: (
    <>
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </>
  ),
  inputs: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-5a5 5 0 0 1 10 0v5" />
      <path d="M12 10V4" />
      <path d="M9 6.5 12 4l3 2.5" />
    </>
  ),
  satellite: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
      <path d="M6.3 6.3 7.7 7.7M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />
    </>
  ),
  advisory: (
    <>
      <path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H14a3.5 3.5 0 0 1 0 7h-4a3.5 3.5 0 0 0 0 5h5.5" />
    </>
  ),
  livestock: (
    <>
      <path d="M4 8c0-2 1.5-3 3-3l1.5 2h7L17 5c1.5 0 3 1 3 3v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M9.5 11h.01M14.5 11h.01" />
      <path d="M10 19v2M14 19v2" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7z" />
      <path d="M9 4v13M15 7v13" />
    </>
  ),

  // Interface marks
  chevron: <path d="m6 9 6 6 6-6" />,
  panelLeft: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </>
  ),
  panelLeftClose: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="m16 9-3 3 3 3" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M18 15.5 18.8 18l2.2.8-2.2.8L18 22l-.8-2.4L15 18.8l2.2-.8z" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5M5 12h11" />
    </>
  ),
}

export default function IconMark({ name, size = 16, className = '', ...rest }) {
  const path = PATHS[name] || PATHS.map
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {path}
    </svg>
  )
}
