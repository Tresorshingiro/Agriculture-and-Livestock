import { Navigate, useParams } from 'react-router-dom'
import { getModule, portal } from '../data/config'

/**
 * A module is not a destination in this workspace — it is a way in. Landing on
 * one opens its first live solution rather than showing a page about it.
 */
export default function ModulePage() {
  const { moduleId } = useParams()
  const current = getModule(moduleId)

  if (!current) return <Navigate to="/" replace />

  const first = current.solutions[0]
  if (first) return <Navigate to={`/module/${current.id}/app/${first.id}`} replace />

  // Unreachable through the published catalog — a module with no live solution
  // is filtered out of it — but a module that loses its last map should still
  // land somewhere that reads as a workspace rather than a blank pane.
  return (
    <section className="welcome" style={{ backgroundImage: `url(${current.image})` }}>
      <span className="fieldwash" />
      <div className="welcome-copy">
        <p className="eyebrow light">{portal.eyebrow}</p>
        <h1>{current.name}</h1>
        <p className="welcome-tagline">{current.description}</p>
        <p className="welcome-hint">
          Open a module on the left, then choose a solution. It will load in this pane.
        </p>
      </div>
    </section>
  )
}
