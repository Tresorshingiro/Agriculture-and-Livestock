import { createContext, useContext } from 'react'

/**
 * Sidebar open state, shared between the header button that toggles it and the
 * workspace that renders it. They are on opposite sides of an <Outlet />, so a
 * prop cannot reach across.
 */
export const WorkspaceNavContext = createContext({ open: true, setOpen: () => {} })

export const useWorkspaceNav = () => useContext(WorkspaceNavContext)

/** The one breakpoint that separates the desktop column from the mobile drawer. */
export const DESKTOP_MIN_WIDTH = 961

export function isDesktop() {
  if (typeof window === 'undefined' || !window.matchMedia) return true
  return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches
}
