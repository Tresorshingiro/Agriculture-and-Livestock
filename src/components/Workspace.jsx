import { Outlet } from 'react-router-dom'
import IconMark from './IconMark'
import WorkspaceSidebar from './WorkspaceSidebar'
import { useWorkspaceNav } from './workspace-nav'

/**
 * The working surface: modules on the left, the chosen map on the right.
 *
 * A pathless layout route, so the pane's own <Outlet /> is what changes when
 * the user picks a solution — the sidebar is never remounted and never loses
 * its scroll position.
 */
export default function Workspace() {
  const { open, setOpen } = useWorkspaceNav()

  return (
    <div className={`workspace ${open ? 'is-nav-open' : 'is-nav-closed'}`}>
      <WorkspaceSidebar />

      {/* Only ever visible under the mobile drawer; CSS hides it on desktop. */}
      <div className="workspace-scrim" onClick={() => setOpen(false)} aria-hidden="true" />

      {/*
        The way back in. The collapse control moved into the sidebar when the
        header was removed, and a collapsed sidebar is zero-width on a desktop
        and off-canvas on a phone — so it takes its own button with it. This one
        floats over the pane and exists only while the column is shut.
      */}
      {!open && (
        <button
          type="button"
          className="nav-reopen"
          onClick={() => setOpen(true)}
          aria-label="Open modules menu"
        >
          <IconMark name="panelLeft" size={16} />
        </button>
      )}

      <div className="workspace-pane">
        <Outlet />
      </div>
    </div>
  )
}
