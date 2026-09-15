import { Navigate, useParams } from 'react-router-dom'
import ArcGisDashboardFrame from '../components/ArcGisDashboardFrame'
import { getModule, getSolution } from '../data/config'

/**
 * A live map in the right pane, over every available pixel. Switching maps is
 * the sidebar's job — there are no breadcrumbs and no picker here.
 */
export default function AppViewer() {
  const { moduleId, solutionId } = useParams()
  const current = getModule(moduleId)
  const solution = getSolution(moduleId, solutionId)

  if (!current || !solution || !solution.embedUrl) return <Navigate to="/" replace />

  return (
    <section className="viewer viewer--pane">
      {/* No title strip: the sidebar already marks the open solution, and the
          application carries its own heading — the strip repeated both. */}
      <ArcGisDashboardFrame title={solution.name} src={solution.embedUrl} />
    </section>
  )
}
