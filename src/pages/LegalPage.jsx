import { Link, Navigate, useParams } from 'react-router-dom'
import { portal } from '../data/config'

const PAGES = {
  disclaimer: {
    title: 'Data Disclaimer',
    body: [
      `The mapping applications published on ${portal.name} are provided as-is. Layers are compiled from field surveys, satellite observation and administrative records held by partner institutions, and each carries the accuracy and the collection date of its own source.`,
      'Nothing shown here establishes a boundary, a title or an entitlement. Confirm any figure against the responsible institution before relying on it for a decision, a transaction or a legal purpose.',
    ],
  },
  privacy: {
    title: 'Privacy',
    body: [
      'Signing in authenticates you against your own GeoHub account. This workspace keeps a session cookie so the applications you open can load under that account; it never stores your password, and your GeoHub token stays on the server rather than in your browser.',
      'Do not share your password or leave a signed-in session open on a shared machine. Sign out when you are finished, and report a suspected account compromise to your GeoHub administrator.',
    ],
  },
  terms: {
    title: 'Terms of Use',
    body: [
      'Access is granted for lawful use in support of agriculture and livestock work in Rwanda. Do not use the applications to harvest data in bulk, to attempt access to layers your account has not been granted, or in any way that disrupts service for other users.',
      'Content remains the property of the Rwanda Space Agency and the institutions that supplied it. Reuse and redistribution require the permission of the data owner.',
    ],
  },
  accessibility: {
    title: 'Accessibility',
    body: [
      'This workspace can be operated from the keyboard: the collapse control, the modules list and every solution link are reachable by tab order and carry a visible focus ring. Colour is never the only signal, and motion respects your system reduced-motion setting.',
      'Each mapping application is a separate product with its own accessibility characteristics, which this workspace cannot change. If a map is unusable for you, tell us which application and what happened so we can raise it with the team that publishes it.',
    ],
  },
}

export default function LegalPage() {
  const { page } = useParams()
  const content = PAGES[page]

  if (!content) return <Navigate to="/" replace />

  return (
    <article className="legal">
      <p className="legal-crumbs">
        <Link to="/">Home</Link> / {content.title}
      </p>
      <h1>{content.title}</h1>
      {content.body.map((paragraph) => (
        <p key={paragraph.slice(0, 32)}>{paragraph}</p>
      ))}
    </article>
  )
}
