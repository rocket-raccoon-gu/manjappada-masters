import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';
import PlayerCard from '../components/PlayerCard.jsx';

export default function RegistrationDetail() {
  const { id } = useParams();
  const { data, loading, error } = useApi(() => api.registration(id), [id]);

  return (
    <section className="section">
      <div className="container">
        <p>
          <Link to="/teams" className="muted">
            ← All teams
          </Link>
        </p>

        {loading && <div className="state-box">Loading team…</div>}
        {error && <div className="error-box">{error}</div>}
        {!loading && !error && data && (
          <>
            <div className="page-hero registration-hero">
              <div className="registration-hero-top">
                {data.team_logo ? (
                  <img className="team-logo-thumb large" src={data.team_logo} alt="" />
                ) : (
                  <span
                    className="crest"
                    style={{ background: '#00299c', width: '5.5rem', height: '5.5rem', fontSize: '1.2rem' }}
                  >
                    {(data.team_name || 'TM').slice(0, 3).toUpperCase()}
                  </span>
                )}
                <div>
                  <h1>{data.team_name}</h1>
                  <p>Masters 7&apos;s Football League · Manjappada Qatar</p>
                </div>
              </div>

              <div className="role-level-grid">
                <div className="role-level-card">
                  <h3>Manager</h3>
                  <dl>
                    <div>
                      <dt>Manager Name</dt>
                      <dd>{data.manager_name}</dd>
                    </div>
                  </dl>
                </div>
                <div className="role-level-card">
                  <h3>Captain</h3>
                  <dl>
                    <div>
                      <dt>Captain Name</dt>
                      <dd>{data.captain_name}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="section-head">
              <div>
                <h2>Squad ID cards</h2>
                <p>Registered players for Masters 7&apos;s Football League.</p>
              </div>
            </div>

            <div className="player-card-grid">
              {(data.players || []).map((player) => (
                <PlayerCard
                  key={player.id}
                  playerName={player.player_name}
                  qidNumber={player.qid_number}
                  dob={player.dob}
                  photo={player.photo}
                  position={player.position}
                  teamName={data.team_name}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
