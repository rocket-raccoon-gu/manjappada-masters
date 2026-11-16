import { Link } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';
import MatchRow from '../components/MatchRow.jsx';

export default function Home() {
  const matches = useApi(() => api.matches(), []);
  const standings = useApi(() => api.standings(), []);
  const scorers = useApi(() => api.scorers(), []);
  const settings = useApi(() => api.settings(), []);
  const registrationOpen = settings.data?.registration_open !== false;

  const upcoming = (matches.data || [])
    .filter((m) => m.status === 'scheduled' || m.status === 'live')
    .slice(0, 4);
  const tablePreview = (standings.data || []).slice(0, 5);
  const topScorers = (scorers.data || []).slice(0, 5);

  return (
    <>
      <section className="hero">
        <img
          className="hero-banner"
          src="/mmfl-banner.jpg"
          alt="Masters 7's Football League — Manjappada Qatar Wing presents — age 35 & above, December 11"
        />
        <div className="hero-band">
          <div className="container hero-band-inner">
            <div className="hero-content">
              <h1 className="hero-brand">
                Masters <em>7&apos;s</em> Football League
              </h1>
              <p className="hero-copy">
                Masters teams · Age 35 &amp; above · December 11 · Follow fixtures, standings, and every club in the race.
              </p>
            </div>
            <div className="cta-row">
              {registrationOpen && (
                <Link className="btn btn-primary" to="/register">
                  Join Now
                </Link>
              )}
              <Link className="btn btn-ghost" to="/fixtures">
                View fixtures
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-two">
          <div>
            <div className="section-head">
              <div>
                <h2>Next kickoffs</h2>
                <p>Upcoming matches across the Masters 7&apos;s calendar.</p>
              </div>
              <Link to="/fixtures" className="muted">
                All fixtures →
              </Link>
            </div>
            {matches.loading && <div className="state-box">Loading fixtures…</div>}
            {matches.error && <div className="error-box">{matches.error}</div>}
            {!matches.loading && !matches.error && (
              <div className="match-list">
                {upcoming.length ? (
                  upcoming.map((match) => <MatchRow key={match.id} match={match} />)
                ) : (
                  <p className="muted">No upcoming matches right now.</p>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="section-head">
              <div>
                <h2>Table</h2>
                <p>Top five after the latest finished matches.</p>
              </div>
            </div>
            {standings.loading && <div className="state-box">Loading table…</div>}
            {standings.error && <div className="error-box">{standings.error}</div>}
            {!standings.loading && !standings.error && (
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Club</th>
                    <th className="num">P</th>
                    <th className="num">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {tablePreview.map((row) => (
                    <tr key={row.id}>
                      <td>{row.position}</td>
                      <td>
                        <div className="team-cell">
                          <span className="crest" style={{ background: row.primary_color }}>
                            {row.short_name}
                          </span>
                          {row.name}
                        </div>
                      </td>
                      <td className="num">{row.played}</td>
                      <td className="num">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="section-head" style={{ marginTop: '2.5rem' }}>
              <div>
                <h2>Scorers</h2>
                <p>Golden boot race so far.</p>
              </div>
            </div>
            {scorers.loading && <div className="state-box">Loading scorers…</div>}
            {scorers.error && <div className="error-box">{scorers.error}</div>}
            {!scorers.loading && !scorers.error && (
              <div className="scorer-list">
                {topScorers.map((scorer, index) => (
                  <div className="scorer-row" key={scorer.id}>
                    <span className="muted">{index + 1}</span>
                    <div>
                      <strong>{scorer.name}</strong>
                      <div className="muted">{scorer.team_name}</div>
                    </div>
                    <strong>{scorer.goals}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
