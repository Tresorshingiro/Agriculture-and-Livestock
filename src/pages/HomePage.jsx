import { portal } from '../data/config'

/** The right pane before a map is chosen: the photograph, and what to do next. */
export default function HomePage() {
  return (
    <section className="welcome" style={{ backgroundImage: `url(${portal.hero})` }}>
      <span className="fieldwash" />
      <div className="welcome-copy">
        <p className="eyebrow light">{portal.eyebrow}</p>
        <h1>{portal.homeTitle}</h1>
        <p className="welcome-tagline">{portal.tagline}</p>
        <p className="welcome-hint">
          Open a module on the left, then choose a solution. It will load in this pane.
        </p>
      </div>
    </section>
  )
}
