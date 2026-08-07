import { Link } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';

export default function Standings() {
  const { data, loading, error } = useApi(() => api.standings(), []);

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero">
          <h1>Standings</h1>
          <p>League table sorted by points, then goal difference and goals scored.</p>
        </div>

        {loading && <div className="state-box">Loading standings…</div>}
        {error && <div className="error-box">{error}</div>}
        {!loading && !error && (
          <table className="standings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Club</th>
                <th className="num">P</th>
                <th className="num">W</th>
                <th className="num">D</th>
                <th className="num">L</th>
                <th className="num">GF</th>
                <th className="num">GA</th>
                <th className="num">GD</th>
                <th className="num">Pts</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((row) => (
                <tr key={row.id}>
                  <td>{row.position}</td>
                  <td>
                    <Link to={`/teams/${row.id}`} className="team-cell">
                      <span className="crest" style={{ background: row.primary_color }}>
                        {row.short_name}
                      </span>
                      {row.name}
                    </Link>
                  </td>
                  <td className="num">{row.played}</td>
                  <td className="num">{row.won}</td>
                  <td className="num">{row.drawn}</td>
                  <td className="num">{row.lost}</td>
                  <td className="num">{row.goals_for}</td>
                  <td className="num">{row.goals_against}</td>
                  <td className="num">{row.goal_difference}</td>
                  <td className="num">
                    <strong>{row.points}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
