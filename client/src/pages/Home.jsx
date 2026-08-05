import { Link } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';
import MatchRow from '../components/MatchRow.jsx';

export default function Home() {
  const tournament = useApi(() => api.tournament(), []);
  const matches = useApi(() => api.matches(), []);
  const standings = useApi(() => api.standings(), []);
  const scorers = useApi(() => api.scorers(), []);

  const upcoming = (matches.data || [])
    .filter((m) => m.status === 'scheduled' || m.status === 'live')
    .slice(0, 4);
  const tablePreview = (standings.data || []).slice(0, 5);
  const topScorers = (scorers.data || []).slice(0, 5);
  const status = tournament.data?.status || 'live';

  return (
    <>
      <section className="hero">
        <div className="hero-field" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-content">
          <p className={`status-pill ${status === 'live' ? 'live' : ''}`}>
            {status === 'live' ? 'Season live' : status}
          </p>
          <h1 className="hero-brand">Manjappada Masters</h1>
          <p className="hero-title">Club Cup football for the grounds that raised us.</p>
          <p className="hero-copy">
            Follow fixtures, the league table, and every club competing for the Masters crown.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/fixtures">
              View fixtures
            </Link>
            <Link className="btn btn-ghost" to="/standings">
              League table
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-two">
          <div>
            <div className="section-head">
              <div>
                <h2>Next on the pitch</h2>
                <p>Upcoming kickoffs across the Club Cup calendar.</p>
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
