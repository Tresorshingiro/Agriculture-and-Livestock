import { Link } from 'react-router-dom'
import IconMark from './IconMark'
import { footer, portal } from '../data/config'

/**
 * Legal pages only. The workspace is a locked viewport and has no room for a
 * footer; these pages scroll, so this is where the small print belongs.
 *
 * Contact lines render only when they hold a real value — a placeholder address
 * on a government page is worse than no address at all.
 */
export default function SiteFooter() {
  const { email, phone } = footer.contact
  const hasContact = Boolean(email || phone)

  return (
    <footer className="site-footer">
      <span className="fieldwash" />

      <div className="footer-inner">
        <div className="footer-col">
          <p className="footer-brand-name">{portal.name}</p>
          <p className="footer-brand-sub">GeoHub Rwanda</p>
          <p>{footer.brandBlurb}</p>
        </div>

        <div className="footer-col">
          <h2>
            <IconMark name="sparkles" size={16} />
            Quick links
          </h2>
          <ul>
            {footer.quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {hasContact && (
          <div className="footer-col">
            <h2>Contact</h2>
            <ul>
              {email && (
                <li>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
              {phone && (
                <li>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="footer-bottom">
        <nav className="footer-legal-links" aria-label="Legal">
          {footer.legalLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p style={{ margin: 0 }}>{footer.updatedNote}</p>
        <p style={{ margin: 0 }}>{footer.copyright}</p>
      </div>
    </footer>
  )
}
