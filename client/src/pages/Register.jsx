import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';
import PlayerCard from '../components/PlayerCard.jsx';
import { compressImage } from '../utils/image.js';

const MAX_PLAYERS = 10;
const QID_LENGTH = 11;
const MAX_DOB = '1991-12-31'; // Masters Cup: age 35+ (born on or before 31 Dec 1991)

function normalizeQid(value) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, QID_LENGTH);
}

function isValidQid(value) {
  return new RegExp(`^\\d{${QID_LENGTH}}$`).test(String(value || ''));
}

function isEligibleDob(value) {
  return Boolean(value) && value <= MAX_DOB;
}

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
  const [agreedToRules, setAgreedToRules] = useState(false);
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
    setSuccessId(null);

    if (!agreedToRules) {
      setError('Please agree to the Rules & Regulations before submitting.');
      return;
    }

    for (const [index, player] of players.entries()) {
      const n = index + 1;
      if (!isValidQid(player.qid_number)) {
        setError(`Player ${n}: QID number must be exactly ${QID_LENGTH} digits.`);
        return;
      }
      if (!isEligibleDob(player.dob)) {
        setError(`Player ${n}: date of birth must be on or before 31 December 1991.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        ...team,
        accepted_rules: true,
        players: [...players]
          .reverse()
          .map(({ player_name, qid_number, dob, photo, position }) => ({
            player_name,
            qid_number: normalizeQid(qid_number),
            dob,
            photo: photo || null,
            position: position || null,
          })),
      };
      const result = await api.registerTeam(payload);
      setSuccessId(result.id);
      setTeam(initialTeam);
      setPlayers([emptyPlayer()]);
      setAgreedToRules(false);
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
            ID cards.
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
                          inputMode="numeric"
                          pattern={`\\d{${QID_LENGTH}}`}
                          maxLength={QID_LENGTH}
                          minLength={QID_LENGTH}
                          title={`Exactly ${QID_LENGTH} digits`}
                          placeholder="11 digits"
                          value={player.qid_number}
                          onChange={(e) =>
                            updatePlayer(player.key, 'qid_number', normalizeQid(e.target.value))
                          }
                        />
                      </label>
                      <label>
                        DOB
                        <input
                          required
                          type="date"
                          max={MAX_DOB}
                          title="Born on or before 31 December 1991"
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

          <div className="register-panel rules-agree">
            <label className="rules-agree-label">
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                required
              />
              <span>
                I have read and agree to the{' '}
                <Link to="/rules" target="_blank" rel="noreferrer">
                  Rules &amp; Regulations (By-Laws)
                </Link>{' '}
                of Masters Cup 2026, including eligibility (age 35+, born on or before 31 December
                1991) and the Team Management undertaking.
              </span>
            </label>
          </div>

          {error && <div className="error-box">{error}</div>}

          <div className="register-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !agreedToRules}
            >
              {submitting ? 'Submitting…' : 'Submit registration'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
