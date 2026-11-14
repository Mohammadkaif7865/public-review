const entityTypes = [
  "Brands",
  "Businesses",
  "Locations",
  "Products",
  "Menu items",
  "Services",
];

const principles = [
  ["Exact targets", "Every review belongs to the exact entity being reviewed."],
  ["Transparent ratings", "Direct ratings remain separate from related aggregates."],
  ["Evidence-backed data", "Published facts retain their source and rights status."],
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Public Review home">
          <span className="brand-mark" aria-hidden="true">★</span>
          <span>Public Review</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#discover">Explore</a>
          <a href="#trust">How it works</a>
          <a href="#businesses">For businesses</a>
        </nav>
        <button className="button button-secondary" type="button">Sign in</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Mumbai pilot · Foundation preview</p>
          <h1>Real people. Honest opinions. <span>Better decisions.</span></h1>
          <p className="hero-description">
            Discover and review the exact brand, branch, product, menu item, or service that matters to you.
          </p>
          <form className="search" role="search">
            <label className="sr-only" htmlFor="search-query">Search Public Review</label>
            <input id="search-query" name="query" placeholder="Search for a brand, business, product, or service" />
            <button className="button button-primary" type="submit">Search</button>
          </form>
          <p className="prototype-note">Search is a UI placeholder in this initial framework.</p>
        </div>
        <aside className="hero-card" aria-label="Project status">
          <span className="status">Framework started</span>
          <h2>Trust-first by design</h2>
          <p>The foundation keeps entity identity, evidence, and rating scope explicit from day one.</p>
          <dl>
            <div><dt>Initial market</dt><dd>Mumbai</dd></div>
            <div><dt>Review scale</dt><dd>1–5</dd></div>
            <div><dt>Current phase</dt><dd>Platform audit</dd></div>
          </dl>
        </aside>
      </section>

      <section className="section" id="discover">
        <div className="section-heading">
          <p className="eyebrow">One discovery experience</p>
          <h2>Explore by entity</h2>
          <p>Results will preserve the context users need to understand exactly what they are viewing.</p>
        </div>
        <div className="entity-grid">
          {entityTypes.map((entity) => <article className="entity-card" key={entity}>{entity}</article>)}
        </div>
      </section>

      <section className="section trust-section" id="trust">
        <div className="section-heading">
          <p className="eyebrow">Why Public Review</p>
          <h2>A clearer review model</h2>
        </div>
        <div className="principle-grid">
          {principles.map(([title, copy]) => (
            <article className="principle" key={title}>
              <span aria-hidden="true">✓</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section business-section" id="businesses">
        <div>
          <p className="eyebrow">For businesses</p>
          <h2>Correct facts and respond—without buying reputation.</h2>
        </div>
        <p>Claim workflows and scoped permissions will be implemented after the product and verification policies are approved.</p>
      </section>

      <footer>
        <span>Public Review</span>
        <span>Product framework · Not a production release</span>
      </footer>
    </main>
  );
}

