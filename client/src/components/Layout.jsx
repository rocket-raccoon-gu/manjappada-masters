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
            <span className="brand-mark">MM</span>
            <span className="brand-text">
              <strong>Manjappada Masters</strong>
              <span>Club Cup 2026</span>
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
          <span>Manjappada Masters Club Cup</span>
          <span>Local tournament hub · React · Express · MySQL</span>
        </div>
      </footer>
    </div>
  );
}
