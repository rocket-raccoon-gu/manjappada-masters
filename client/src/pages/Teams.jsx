import { Link } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';
import { squadProgress } from '../utils/squad';

export default function Teams() {
  const { data, loading, error } = useApi(() => api.registrations(), []);

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero">
          <h1>Teams</h1>
          <p>Joined Masters 7&apos;s squads from Manjappada Qatar — age 35 &amp; above.</p>
        </div>

        {loading && <div className="state-box">Loading teams…</div>}
        {error && <div className="error-box">{error}</div>}
        {!loading && !error && !(data || []).length && (
          <div className="state-box">
            <p>No teams have joined yet.</p>
            <Link className="btn btn-primary" to="/register" style={{ marginTop: '1rem' }}>
              Join Now
            </Link>
          </div>
        )}
        {!loading && !error && (
          <div className="team-grid">
            {(data || []).map((team) => {
              const progress = squadProgress(team.player_count);
              return (
                <Link key={team.id} to={`/registrations/${team.id}`} className="team-tile">
                  {team.team_logo ? (
                    <img className="team-logo-thumb" src={team.team_logo} alt="" />
                  ) : (
                    <span className="crest" style={{ background: '#00299c', width: '3rem', height: '3rem' }}>
                      {(team.team_name || 'TM').slice(0, 3).toUpperCase()}
                    </span>
                  )}
                  <h3>{team.team_name}</h3>
                  <p>
                    Captain {team.captain_name} · {team.player_count} player
                    {team.player_count === 1 ? '' : 's'}
                  </p>
                  <p className="muted">Manager {team.manager_name}</p>
                  <p
                    className={
                      progress.complete ? 'team-progress team-progress--complete' : 'team-progress'
                    }
                  >
                    {progress.label}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
