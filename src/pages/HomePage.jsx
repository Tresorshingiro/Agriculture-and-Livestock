import { Navigate } from 'react-router-dom'
import { modules } from '../data/config'

/*
 * There is no welcome page: signing in lands straight on the first dashboard
 * in the sidebar.
 *
 * Walked in the sidebar's own order — each module's groups, or its flat list
 * with the data collection forms left out — so "first" is the top row the user
 * sees. Only a solution with an embedUrl qualifies: AppViewer sends anything
 * else back here, which would loop.
 */
function firstDashboardPath() {
  for (const mod of modules) {
    const solutions = mod.groups ? mod.groups.flatMap((g) => g.solutions) : mod.solutions
    const first = solutions.find((s) => !s.isForm && s.embedUrl)
    if (first) return `/module/${mod.id}/app/${first.id}`
  }
  return null
}

export default function HomePage() {
  const path = firstDashboardPath()
  // Only an empty catalog gets here; the pane simply stays blank.
  return path ? <Navigate to={path} replace /> : null
}
