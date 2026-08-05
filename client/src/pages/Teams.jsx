import { Link } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';

export default function Teams() {
  const { data, loading, error } = useApi(() => api.teams(), []);

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero">
          <h1>Teams</h1>
          <p>Eight clubs chasing the Manjappada Masters crown this season.</p>
        </div>

        {loading && <div className="state-box">Loading teams…</div>}
        {error && <div className="error-box">{error}</div>}
        {!loading && !error && (
          <div className="team-grid">
            {(data || []).map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="team-tile">
                <span className="crest" style={{ background: team.primary_color, width: '3rem', height: '3rem' }}>
                  {team.short_name}
                </span>
                <h3>{team.name}</h3>
                <p>
                  {team.city} · Coach {team.coach || 'TBD'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
