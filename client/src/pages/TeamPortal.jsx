import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getTeamToken, setTeamToken } from '../api';
import useApi from '../hooks/useApi';
import { compressImage } from '../utils/image.js';
import {
  MAX_DOB,
  MIN_DOB,
  digitsOnly,
  dobError,
  qidError,
} from '../utils/validation.js';
import { MAX_PLAYERS } from '../utils/squad.js';
import SquadProgress from '../components/SquadProgress.jsx';

const emptyPlayer = {
  player_name: '',
  qid_number: '',
  dob: '',
  position: '',
  photo: '',
};

export default function TeamPortal() {
  const settings = useApi(() => api.settings(), []);
  const registrationOpen = settings.data?.registration_open === true;
  const [token, setToken] = useState(() => getTeamToken());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [playerForm, setPlayerForm] = useState(emptyPlayer);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadTeam = useCallback(async () => {
    if (!getTeamToken()) {
      setTeam(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.teamMe();
      setTeam(data);
    } catch (err) {
      setTeamToken('');
      setToken('');
      setTeam(null);
      setError(err.message || 'Session expired — please log in again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam, token]);

  async function onLogin(event) {
    event.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const result = await api.teamLogin(username, password);
      setTeamToken(result.token);
      setToken(result.token);
      setPassword('');
      setMessage('');
    } catch (err) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  }

  function logout() {
    setTeamToken('');
    setToken('');
    setTeam(null);
    setPlayerForm(emptyPlayer);
    setEditingId(null);
    setMessage('');
  }

  function updatePlayerField(field, value) {
    setPlayerForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onPlayerPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const photo = await compressImage(file, { maxWidth: 900, quality: 0.78 });
      updatePlayerField('photo', photo);
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(player) {
    setEditingId(player.id);
    setPlayerForm({
      player_name: player.player_name || '',
      qid_number: player.qid_number || '',
      dob: player.dob || '',
      position: player.position || '',
      photo: player.photo || '',
    });
    setMessage('');
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setPlayerForm(emptyPlayer);
  }

  async function onSavePlayer(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    const qid = digitsOnly(playerForm.qid_number);
    const qidErr = qidError(qid);
    if (qidErr) {
      setError(qidErr);
      return;
    }
    const birthErr = dobError(playerForm.dob);
    if (birthErr) {
      setError(birthErr);
      return;
    }
    if (!editingId && !playerForm.photo) {
      setError('Please upload an ID card / photo.');
      return;
    }

    setSaving(true);
    const payload = {
      player_name: playerForm.player_name.trim(),
      qid_number: qid,
      dob: playerForm.dob,
      position: playerForm.position.trim() || null,
      photo: playerForm.photo || null,
    };
    try {
      if (editingId) {
        await api.updateTeamPlayer(editingId, payload);
        setMessage('Player updated.');
      } else {
        await api.addTeamPlayer(payload);
        setMessage('Player added.');
      }
      setPlayerForm(emptyPlayer);
      setEditingId(null);
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Could not save player');
    } finally {
      setSaving(false);
    }
  }

  async function onDeletePlayer(id) {
    if (!window.confirm('Remove this player from your squad?')) return;
    setError('');
    setMessage('');
    try {
      await api.deleteTeamPlayer(id);
      setMessage('Player removed.');
      if (editingId === id) cancelEdit();
      await loadTeam();
    } catch (err) {
      setError(err.message || 'Could not delete player');
    }
  }

  if (!token) {
    return (
      <section className="section">
        <div className="container">
          <div className="page-hero">
            <h1>Team login</h1>
            <p>
              Sign in with your team name and password to add or edit players. Only your own squad
              is visible.
            </p>
          </div>

          <form className="register-form team-login-form" onSubmit={onLogin}>
            <div className="register-panel">
              <div className="form-grid">
                <label className="form-span">
                  Username (team name)
                  <input
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </label>
                <label className="form-span">
                  Password
                  <div className="password-field">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                </label>
                <label className="form-span show-password-toggle">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <span>Show password</span>
                </label>
              </div>
              {loginError && <div className="error-box">{loginError}</div>}
              {error && !loginError && <div className="error-box">{error}</div>}
              <div className="register-actions">
                <button type="submit" className="btn btn-primary" disabled={loggingIn}>
                  {loggingIn ? 'Signing in…' : 'Sign in'}
                </button>
                {registrationOpen ? (
                  <Link className="btn btn-ghost on-light" to="/register">
                    New team? Join Now
                  </Link>
                ) : (
                  <p className="muted" style={{ margin: 0 }}>
                    Registration closed — max teams reached.
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p className="muted">Loading your team…</p>
        </div>
      </section>
    );
  }

  const players = team?.players || [];
  const canAddMore = players.length < MAX_PLAYERS;

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero register-hero">
          <h1>{team?.team_name || 'My team'}</h1>
          <p>
            Add up to {MAX_PLAYERS} players with QID and ID card photo. Return anytime with username{' '}
            <strong>{team?.username}</strong>.
          </p>
          <SquadProgress
            playerCount={players.length}
            hint="— keep adding players to complete your squad."
          />
        </div>

        <div className="cta-row" style={{ marginBottom: '1.5rem' }}>
          <button type="button" className="btn btn-ghost on-light" onClick={logout}>
            Log out
          </button>
          <Link className="btn btn-ghost on-light" to="/rules">
            Rules
          </Link>
        </div>

        <div className="register-panel" style={{ marginBottom: '1.5rem' }}>
          <h2>Team contacts</h2>
          <div className="form-grid">
            <div>
              <span className="muted">Manager</span>
              <p>
                {team?.manager_name}
                <br />
                {team?.contact_number}
                <br />
                {team?.email}
              </p>
            </div>
            <div>
              <span className="muted">Captain</span>
              <p>
                {team?.captain_name}
                <br />
                {team?.captain_mobile}
                <br />
                {team?.captain_email}
              </p>
            </div>
          </div>
          {team?.payment_receipt && (
            <div className="logo-preview receipt-preview">
              <span className="muted">Payment receipt on file</span>
              <img src={team.payment_receipt} alt="Payment receipt" />
            </div>
          )}
        </div>

        <div className="register-panel" style={{ marginBottom: '1.5rem' }}>
          <h2>Squad ({players.length}/{MAX_PLAYERS})</h2>
          {players.length === 0 ? (
            <p className="muted">No players yet — add your first player below.</p>
          ) : (
            <ul className="team-player-list">
              {players.map((player) => (
                <li key={player.id} className="team-player-row">
                  <div className="team-player-meta">
                    {player.photo ? (
                      <img src={player.photo} alt="" className="team-player-thumb" />
                    ) : (
                      <span className="team-player-thumb placeholder" />
                    )}
                    <div>
                      <strong>{player.player_name}</strong>
                      {player.position && <span className="muted"> · {player.position}</span>}
                      <div className="muted">
                        QID {player.qid_number}
                        {player.dob ? ` · DOB ${player.dob}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="team-player-actions">
                    <button
                      type="button"
                      className="btn btn-ghost on-light"
                      onClick={() => startEdit(player)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost on-light"
                      onClick={() => onDeletePlayer(player.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(canAddMore || editingId) && (
          <form className="register-form" onSubmit={onSavePlayer}>
            <div className="register-panel">
              <h2>{editingId ? 'Edit player' : 'Add player'}</h2>
              <div className="form-grid">
                <label>
                  Full name
                  <input
                    required
                    value={playerForm.player_name}
                    onChange={(e) => updatePlayerField('player_name', e.target.value)}
                  />
                </label>
                <label>
                  QID number
                  <input
                    required
                    inputMode="numeric"
                    pattern="\d{11}"
                    maxLength={11}
                    title="Qatar ID must be 11 digits"
                    value={playerForm.qid_number}
                    onChange={(e) =>
                      updatePlayerField('qid_number', digitsOnly(e.target.value).slice(0, 11))
                    }
                    placeholder="11 digits"
                  />
                  <span className="field-hint">Exactly 11 digits</span>
                </label>
                <label>
                  Date of birth
                  <input
                    required
                    type="date"
                    min={MIN_DOB}
                    max={MAX_DOB}
                    value={playerForm.dob}
                    onChange={(e) => updatePlayerField('dob', e.target.value)}
                  />
                  <span className="field-hint">Age 35+ — on or before 31 Dec 1991</span>
                </label>
                <label>
                  Position
                  <input
                    value={playerForm.position}
                    onChange={(e) => updatePlayerField('position', e.target.value)}
                    placeholder="Optional"
                  />
                </label>
                <label className="form-span">
                  ID card / photo
                  <input type="file" accept="image/*" onChange={onPlayerPhoto} />
                </label>
              </div>
              {playerForm.photo && (
                <div className="player-media-preview">
                  <img src={playerForm.photo} alt="Player ID / photo" />
                </div>
              )}
              {error && <div className="error-box">{error}</div>}
              {message && <div className="success-box">{message}</div>}
              <div className="register-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Update player' : 'Add player'}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-ghost on-light" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {!canAddMore && !editingId && (
          <p className="muted">
            Squad is full ({MAX_PLAYERS} players). Edit or remove a player to make space.
          </p>
        )}

        {error && !(canAddMore || editingId) && <div className="error-box">{error}</div>}
        {message && !(canAddMore || editingId) && <div className="success-box">{message}</div>}
      </div>
    </section>
  );
}
