import { NavLink, useParams } from 'react-router-dom'
import IconMark from './IconMark'
import { useWorkspaceNav } from './workspace-nav'
import { useAuth } from '../auth/AuthContext'
import { modules, portal } from '../data/config'
import { brand } from '../lib/brand'

/**
 * The whole of the portal's chrome, in one white column.
 *
 * Three bands: the brand badge, the portal name and the collapse control at the
 * top; the module index in the middle; a Logout row at the bottom. The
 * signed-in user's name is deliberately not shown, matching the sibling portals. Only the middle band scrolls, so the name and Logout stay put
 * however long the catalog grows.
 *
 * Each module is a heading with its own icon tile, its solutions listed under
 * it. There are no rails and no counts: spacing and the tiles separate the
 * modules, and every solution is on screen, so a number adds nothing. The same
 * layout the other split portals use, in this portal's leaf green.
 */
export default function WorkspaceSidebar() {
  const { moduleId, solutionId } = useParams()
  const { setOpen } = useWorkspaceNav()
  const { signOut } = useAuth()

  return (
    <aside
      className="workspace-sidebar"
      style={{ '--brand-accent': brand.accent, '--brand-tint': brand.tint }}
    >
      <div className="sidebar__top">
        <NavLink to="/" className="sidebar__brand">
          <span className="sidebar__badge" aria-hidden="true">
            <IconMark name={brand.icon} size={18} />
          </span>
          <span className="sidebar__name">{portal.name}</span>
        </NavLink>

        <button
          type="button"
          className="sidebar__collapse"
          onClick={() => setOpen(false)}
          aria-label="Collapse modules menu"
        >
          <IconMark name="panelLeftClose" size={16} />
        </button>
      </div>

      <nav className="sidebar__scroll" aria-label="Modules">
        {modules.map((mod) => {
          const isActive = mod.id === moduleId

          return (
            <section
              key={mod.id}
              className={`navsection${isActive ? ' is-active' : ''}`}
              aria-label={mod.shortName}
            >
              <div className="navhead">
                <span className="navhead__tile" aria-hidden="true">
                  <IconMark name={mod.icon} size={16} />
                </span>
                <span className="navhead__title">{mod.shortName}</span>
              </div>

              <ul className="modlist modlist--nested">
                {mod.solutions.map((solution) => (
                  <li key={solution.id}>
                    <NavLink
                      to={`/module/${mod.id}/app/${solution.id}`}
                      className={`modlist__item${
                        solution.id === solutionId && isActive ? ' is-active' : ''
                      }`}
                      // The short label is what the sidebar shows; the full
                      // catalog name stays available to assistive tech and hover.
                      title={solution.name}
                    >
                      <IconMark name={solution.icon} size={16} />
                      <span>{solution.shortName}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </nav>

      <div className="sidebar__foot">
        <button type="button" className="logout" onClick={signOut}>
          <IconMark name="logout" size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
