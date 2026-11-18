import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';

export default function TeamDetail() {
  const { id } = useParams();
  const { data, loading, error } = useApi(() => api.team(id), [id]);

  return (
    <section className="section">
      <div className="container">
        <p>
          <Link to="/teams" className="muted">
            ← All teams
          </Link>
        </p>

        {loading && <div className="state-box">Loading squad…</div>}
        {error && <div className="error-box">{error}</div>}
        {!loading && !error && data && (
          <>
            <div className="page-hero">
              <div className="team-cell" style={{ marginBottom: '0.75rem' }}>
                <span
                  className="crest"
                  style={{ background: data.primary_color, width: '3.2rem', height: '3.2rem', fontSize: '1rem' }}
                >
                  {data.short_name}
                </span>
              </div>
              <h1>{data.name}</h1>
              <p>
                {data.city}
                {data.coach ? ` · ${data.coach}` : ''}
                {data.founded_year ? ` · Est. ${data.founded_year}` : ''}
              </p>
            </div>

            <div className="section-head">
              <div>
                <h2>Squad</h2>
                <p>Registered players for the Masters 7s Football Cup season.</p>
              </div>
            </div>

            <div className="player-grid">
              {(data.players || []).map((player) => (
                <div className="player-item" key={player.id}>
                  <span className="num">{player.jersey_number}</span>
                  <div>
                    <strong>{player.name}</strong>
                    <div className="muted">
                      {player.position}
                      {player.age ? ` · ${player.age}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
