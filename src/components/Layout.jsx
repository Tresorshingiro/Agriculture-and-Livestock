import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import SiteFooter from './SiteFooter'
import { WorkspaceNavContext, isDesktop } from './workspace-nav'

/**
 * The chrome around every signed-in route.
 *
 * There is no header. The portal name, the collapse control and the signed-in
 * user all moved into the sidebar, which leaves the workspace as two columns
 * and gives the map the full height of the window. Legal routes scroll
 * normally and carry the footer; they have no sidebar, so their way back is
 * the "Home /" crumb the page itself renders.
 *
 * This component is now only the shell and the sidebar's open state, which
 * lives here because it outlives any single route.
 */
export default function Layout() {
  const { pathname } = useLocation()
  const isLegal = pathname.startsWith('/legal')

  // Open by default on a desktop, closed where it would cover the map.
  const [open, setOpen] = useState(() => isDesktop())

  useEffect(() => {
    // Only the mobile drawer closes on navigation: it sits over the pane, so
    // leaving it open would hide the map the user just chose. On a desktop the
    // sidebar is a column beside the map and must stay exactly as the user left
    // it — collapsing it on every pick would fight them.
    if (!isDesktop()) setOpen(false)
  }, [pathname])

  const nav = useMemo(() => ({ open, setOpen }), [open])

  return (
    <WorkspaceNavContext.Provider value={nav}>
      <div className={`shell ${isLegal ? 'shell--page' : 'shell--workspace'}`}>
        <div className="main">
          <Outlet />
        </div>

        {isLegal && <SiteFooter />}
      </div>
    </WorkspaceNavContext.Provider>
  )
}
