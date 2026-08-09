import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/fixtures', label: 'Fixtures' },
  { to: '/standings', label: 'Standings' },
  { to: '/teams', label: 'Teams' },
];

export default function Layout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container nav-row">
          <NavLink to="/" className="brand">
            <img className="brand-logo" src="/mmfl-logo.png" alt="Masters league crest" />
            <span className="brand-text">
              <strong>Masters 7&apos;s</strong>
              <span>Manjappada Qatar</span>
            </span>
          </NavLink>
          <nav className="nav-links" aria-label="Primary">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-row">
          <span className="footer-brand">
            <img src="/mmfl-logo.png" alt="" />
            Masters 7&apos;s Football League
          </span>
          <span>Manjappada Qatar Wing</span>
        </div>
      </footer>
    </div>
  );
}
