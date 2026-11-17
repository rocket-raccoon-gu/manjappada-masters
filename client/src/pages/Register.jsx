import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';
import PlayerCard from '../components/PlayerCard.jsx';
import { compressImage } from '../utils/image.js';

const MAX_PLAYERS = 10;

const emptyPlayer = () => ({
  key: crypto.randomUUID(),
  player_name: '',
  qid_number: '',
  dob: '',
  photo: '',
  position: '',
});

const initialTeam = {
  team_name: '',
  manager_name: '',
  contact_number: '',
  email: '',
  captain_name: '',
  captain_mobile: '',
  captain_email: '',
  team_logo: '',
};

export default function Register() {
  const settings = useApi(() => api.settings(), []);
  const registrationOpen = settings.data?.registration_open !== false;
  const [team, setTeam] = useState(initialTeam);
  const [players, setPlayers] = useState([emptyPlayer()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState(null);

  function updateTeam(field, value) {
    setTeam((prev) => ({ ...prev, [field]: value }));
  }

  function updatePlayer(key, field, value) {
    setPlayers((prev) =>
      prev.map((player) => (player.key === key ? { ...player, [field]: value } : player))
    );
  }

  async function onTeamLogoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const photo = await compressImage(file, { maxWidth: 360, quality: 0.75 });
      updateTeam('team_logo', photo);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onPlayerPhotoChange(key, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const photo = await compressImage(file, { maxWidth: 420, quality: 0.72 });
      updatePlayer(key, 'photo', photo);
    } catch (err) {
      setError(err.message);
    }
  }

  function addPlayer() {
    setPlayers((prev) => (prev.length >= MAX_PLAYERS ? prev : [emptyPlayer(), ...prev]));
  }

  function removePlayer(key) {
    setPlayers((prev) => (prev.length === 1 ? prev : prev.filter((player) => player.key !== key)));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    setSuccessId(null);

    try {
      const payload = {
        ...team,
        players: [...players]
          .reverse()
          .map(({ player_name, qid_number, dob, photo, position }) => ({
            player_name,
            qid_number,
            dob,
            photo: photo || null,
            position: position || null,
          })),
      };
      const result = await api.registerTeam(payload);
      setSuccessId(result.id);
      setTeam(initialTeam);
      setPlayers([emptyPlayer()]);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!registrationOpen && !settings.loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="page-hero">
            <h1>Registration closed</h1>
            <p>Team registration is not open right now. Check the teams page for joined squads.</p>
          </div>
          <Link className="btn btn-primary" to="/teams">
            View teams
          </Link>
        </div>
      </section>
    );
  }

  if (successId) {
    return (
      <section className="section">
        <div className="container">
          <div className="page-hero">
            <h1>Registration received</h1>
            <p>
              Team registration #{successId} is saved. We will review your squad for Masters 7&apos;s
              Football League.
            </p>
          </div>
          <div className="cta-row">
            <Link className="btn btn-primary" to={`/registrations/${successId}`}>
              View team
            </Link>
            <button type="button" className="btn btn-ghost on-light" onClick={() => setSuccessId(null)}>
              Register another team
            </button>
            <Link className="btn btn-ghost on-light" to="/teams">
              All teams
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero register-hero">
          <h1>Join Now</h1>
          <p>
            Masters 7&apos;s Football League · Manjappada Qatar — submit your team details and player
            ID cards. Review the{' '}
            <Link to="/rules">Rules &amp; Regulations</Link> before registering.
          </p>
        </div>

        <form className="register-form" onSubmit={onSubmit}>
          <div className="register-panel">
            <h2>Team details</h2>
            <div className="form-grid">
              <label>
                Team Name
                <input
                  required
                  value={team.team_name}
                  onChange={(e) => updateTeam('team_name', e.target.value)}
                />
              </label>
              <label>
                Team Logo
                <input type="file" accept="image/*" onChange={onTeamLogoChange} />
              </label>
            </div>
            {team.team_logo && (
              <div className="logo-preview">
                <img src={team.team_logo} alt={`${team.team_name || 'Team'} logo`} />
              </div>
            )}

            <div className="register-level">
              <h3>Manager</h3>
              <div className="form-grid">
                <label>
                  Manager Name
                  <input
                    required
                    value={team.manager_name}
                    onChange={(e) => updateTeam('manager_name', e.target.value)}
                  />
                </label>
                <label>
                  Mobile Number
                  <input
                    required
                    value={team.contact_number}
                    onChange={(e) => updateTeam('contact_number', e.target.value)}
                  />
                </label>
                <label className="form-span">
                  Email Id
                  <input
                    required
                    type="email"
                    value={team.email}
                    onChange={(e) => updateTeam('email', e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="register-level">
              <h3>Captain</h3>
              <div className="form-grid">
                <label>
                  Captain Name
                  <input
                    required
                    value={team.captain_name}
                    onChange={(e) => updateTeam('captain_name', e.target.value)}
                  />
                </label>
                <label>
                  Mobile Number
                  <input
                    required
                    value={team.captain_mobile}
                    onChange={(e) => updateTeam('captain_mobile', e.target.value)}
                  />
                </label>
                <label className="form-span">
                  Email Id
                  <input
                    required
                    type="email"
                    value={team.captain_email}
                    onChange={(e) => updateTeam('captain_email', e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="register-panel">
            <div className="section-head">
              <div>
                <h2>Players</h2>
                <p>
                  Add each player — the ID card updates as you type. Maximum {MAX_PLAYERS} players
                  per team{players.length >= MAX_PLAYERS ? ' (limit reached).' : `.`}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addPlayer}
                disabled={players.length >= MAX_PLAYERS}
              >
                Add player
              </button>
            </div>

            <div className="player-register-list">
              {players.map((player, index) => (
                <div className="player-register-row" key={player.key}>
                  <div className="player-register-fields">
                    <div className="player-register-heading">
                      <h3>Player {index + 1}</h3>
                      {players.length > 1 && (
                        <button
                          type="button"
                          className="chip"
                          onClick={() => removePlayer(player.key)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <label>
                        Player Name
                        <input
                          required
                          value={player.player_name}
                          onChange={(e) => updatePlayer(player.key, 'player_name', e.target.value)}
                        />
                      </label>
                      <label>
                        QID Number
                        <input
                          required
                          value={player.qid_number}
                          onChange={(e) => updatePlayer(player.key, 'qid_number', e.target.value)}
                        />
                      </label>
                      <label>
                        DOB
                        <input
                          required
                          type="date"
                          value={player.dob}
                          onChange={(e) => updatePlayer(player.key, 'dob', e.target.value)}
                        />
                      </label>
                      <label>
                        Position (optional)
                        <input
                          value={player.position}
                          onChange={(e) => updatePlayer(player.key, 'position', e.target.value)}
                          placeholder="GK / DF / MF / FW"
                        />
                      </label>
                      <label className="form-span">
                        Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onPlayerPhotoChange(player.key, e)}
                        />
                      </label>
                    </div>
                  </div>
                  <PlayerCard
                    playerName={player.player_name}
                    qidNumber={player.qid_number}
                    dob={player.dob}
                    photo={player.photo}
                    position={player.position}
                    teamName={team.team_name}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="register-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit registration'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
