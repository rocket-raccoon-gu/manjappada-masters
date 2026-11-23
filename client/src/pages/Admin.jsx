import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getAdminToken, setAdminToken } from '../api';

export default function Admin() {
  const [token, setToken] = useState(getAdminToken());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState('registration');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [teams, setTeams] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [openTeamId, setOpenTeamId] = useState(null);
  const [teamDetail, setTeamDetail] = useState(null);
  const [matches, setMatches] = useState([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [settings, regs, fixtures, clubList] = await Promise.all([
      api.settings(),
      api.registrations(),
      api.matches(),
      api.teams(),
    ]);
    setRegistrationOpen(settings.registration_open);
    setTeams(regs);
    setMatches(fixtures);
    setClubs(clubList);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!openTeamId) {
      setTeamDetail(null);
      return;
    }
    api
      .adminRegistration(openTeamId)
      .then(setTeamDetail)
      .catch((err) => setError(err.message));
  }, [openTeamId]);

  async function login(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await api.adminLogin(password);
      setAdminToken(result.token);
      setToken(result.token);
      setPassword('');
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    setAdminToken('');
    setToken('');
  }

  async function run(action) {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await action();
      await refresh();
      if (openTeamId) {
        setTeamDetail(await api.adminRegistration(openTeamId));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <section className="section">
        <div className="container admin-login">
          <div className="page-hero">
            <h1>Admin</h1>
            <p>Sign in to manage registration, teams, fixtures, and scores.</p>
          </div>
          <form className="register-form" onSubmit={login}>
            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </label>
            <label className="show-password-toggle">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <span>Show password</span>
            </label>
            {error && <div className="error-box">{error}</div>}
            <button type="submit" className="btn btn-primary">
              Sign in
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero admin-hero">
          <div>
            <h1>Admin panel</h1>
            <p>Close registration, manage teams, create fixtures, and update scores.</p>
          </div>
          <button type="button" className="chip" onClick={logout}>
            Sign out
          </button>
        </div>

        <div className="filter-row">
          {[
            ['registration', 'Registration'],
            ['teams', 'Teams'],
            ['fixtures', 'Fixtures'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`chip ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <div className="error-box">{error}</div>}
        {notice && <p className="muted">{notice}</p>}

        {tab === 'registration' && (
          <div className="register-panel">
            <h2>Registration</h2>
            <p className="muted">
              Status: {registrationOpen ? 'Open — teams can join' : 'Closed — Join Now is hidden'}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await api.setRegistrationOpen(!registrationOpen);
                  setNotice(registrationOpen ? 'Registration closed.' : 'Registration opened.');
                })
              }
            >
              {registrationOpen ? 'Close registration' : 'Open registration'}
            </button>
          </div>
        )}

        {tab === 'teams' && (
          <div className="admin-team-list">
            {!teams.length && <p className="muted">No registered teams yet.</p>}
            {teams.map((team) => (
              <article className="admin-team" key={team.id}>
                <div className="admin-team-head">
                  <div>
                    <h3>{team.team_name}</h3>
                    <p className="muted">
                      {team.player_count} players · Captain {team.captain_name}
                    </p>
                  </div>
                  <div className="cta-row">
                    <button
                      type="button"
                      className="chip"
                      onClick={() => setOpenTeamId(openTeamId === team.id ? null : team.id)}
                    >
                      {openTeamId === team.id ? 'Hide' : 'Manage'}
                    </button>
                    <button
                      type="button"
                      className="chip"
                      disabled={busy}
                      onClick={() => {
                        if (!window.confirm(`Remove ${team.team_name}?`)) return;
                        run(async () => {
                          await api.deleteRegistration(team.id);
                          if (openTeamId === team.id) setOpenTeamId(null);
                          setNotice(`${team.team_name} removed.`);
                        });
                      }}
                    >
                      Remove team
                    </button>
                  </div>
                </div>

                {openTeamId === team.id && teamDetail && teamDetail.id === team.id && (
                  <TeamEditor
                    team={teamDetail}
                    busy={busy}
                    onSave={(body) =>
                      run(async () => {
                        await api.updateRegistration(team.id, body);
                        setNotice('Team details updated.');
                      })
                    }
                    onSavePlayer={(playerId, body) =>
                      run(async () => {
                        await api.updatePlayer(playerId, body);
                        setNotice('Player updated.');
                      })
                    }
                    onRemovePlayer={(playerId, name) => {
                      if (!window.confirm(`Remove ${name}?`)) return;
                      run(async () => {
                        await api.deletePlayer(playerId);
                        setNotice(`${name} removed.`);
                      });
                    }}
                  />
                )}
              </article>
            ))}
          </div>
        )}

        {tab === 'fixtures' && (
          <div className="admin-score-list">
            <div className="register-panel">
              <h2>New fixture</h2>
              <p className="muted">Pick two teams, then set kickoff, venue, and matchday.</p>
              <FixtureForm
                options={fixtureTeamOptions(teams, clubs)}
                nextMatchday={nextMatchday(matches)}
                busy={busy}
                onCreate={(body) =>
                  run(async () => {
                    await api.createMatch(body);
                    setNotice('Fixture added.');
                  })
                }
              />
            </div>

            <h2>Fixtures &amp; scores</h2>
            {!matches.length && <p className="muted">No fixtures yet.</p>}
            {matches.map((match) => (
              <FixtureRow
                key={match.id}
                match={match}
                options={fixtureTeamOptions(teams, clubs)}
                busy={busy}
                onSave={(body) =>
                  run(async () => {
                    await api.updateMatch(match.id, body);
                    setNotice('Fixture updated.');
                  })
                }
                onDelete={() => {
                  if (!window.confirm(`Remove ${match.home_team} vs ${match.away_team}?`)) return;
                  run(async () => {
                    await api.deleteMatch(match.id);
                    setNotice('Fixture removed.');
                  });
                }}
              />
            ))}
          </div>
        )}

        <p className="muted" style={{ marginTop: '2rem' }}>
          <Link to="/">Back to site</Link>
        </p>
      </div>
    </section>
  );
}

function TeamEditor({ team, busy, onSave, onSavePlayer, onRemovePlayer }) {
  const [form, setForm] = useState({
    team_name: team.team_name || '',
    manager_name: team.manager_name || '',
    contact_number: team.contact_number || '',
    email: team.email || '',
    captain_name: team.captain_name || '',
    captain_mobile: team.captain_mobile || '',
    captain_email: team.captain_email || '',
  });

  useEffect(() => {
    setForm({
      team_name: team.team_name || '',
      manager_name: team.manager_name || '',
      contact_number: team.contact_number || '',
      email: team.email || '',
      captain_name: team.captain_name || '',
      captain_mobile: team.captain_mobile || '',
      captain_email: team.captain_email || '',
    });
  }, [team]);

  return (
    <div className="admin-editor">
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
      >
        <label>
          Team Name
          <input value={form.team_name} onChange={(e) => setForm({ ...form, team_name: e.target.value })} />
        </label>
        <label>
          Manager Name
          <input
            value={form.manager_name}
            onChange={(e) => setForm({ ...form, manager_name: e.target.value })}
          />
        </label>
        <label>
          Manager Mobile
          <input
            value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
          />
        </label>
        <label>
          Manager Email
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Captain Name
          <input
            value={form.captain_name}
            onChange={(e) => setForm({ ...form, captain_name: e.target.value })}
          />
        </label>
        <label>
          Captain Mobile
          <input
            value={form.captain_mobile}
            onChange={(e) => setForm({ ...form, captain_mobile: e.target.value })}
          />
        </label>
        <label className="form-span">
          Captain Email
          <input
            value={form.captain_email}
            onChange={(e) => setForm({ ...form, captain_email: e.target.value })}
          />
        </label>
        <div className="form-span">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Save team details
          </button>
        </div>
      </form>

      {team.payment_receipt ? (
        <div className="admin-receipt">
          <h3>Payment receipt</h3>
          <a href={team.payment_receipt} target="_blank" rel="noreferrer">
            <img
              src={team.payment_receipt}
              alt={`${team.team_name} payment receipt`}
              className="admin-receipt-img"
            />
          </a>
        </div>
      ) : (
        <p className="muted">No payment receipt on file for this team.</p>
      )}

      <h3>Players</h3>
      {(team.players || []).map((player) => (
        <PlayerEditor
          key={player.id}
          player={player}
          busy={busy}
          onSave={onSavePlayer}
          onRemove={onRemovePlayer}
        />
      ))}
    </div>
  );
}

function PlayerEditor({ player, busy, onSave, onRemove }) {
  const [form, setForm] = useState({
    player_name: player.player_name || '',
    qid_number: player.qid_number || '',
    dob: player.dob || '',
    position: player.position || '',
  });

  useEffect(() => {
    setForm({
      player_name: player.player_name || '',
      qid_number: player.qid_number || '',
      dob: player.dob || '',
      position: player.position || '',
    });
  }, [player]);

  return (
    <form
      className="form-grid admin-player-row"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(player.id, form);
      }}
    >
      <label>
        Player Name
        <input
          value={form.player_name}
          onChange={(e) => setForm({ ...form, player_name: e.target.value })}
        />
      </label>
      <label>
        QID
        <input
          value={form.qid_number}
          onChange={(e) => setForm({ ...form, qid_number: e.target.value })}
        />
      </label>
      <label>
        DOB
        <input
          type="date"
          value={form.dob}
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
        />
      </label>
      <label>
        Position
        <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
      </label>
      <div className="form-span cta-row">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Save player
        </button>
        <button
          type="button"
          className="chip"
          disabled={busy}
          onClick={() => onRemove(player.id, player.player_name)}
        >
          Remove player
        </button>
      </div>
    </form>
  );
}

function fixtureTeamOptions(registrations, clubs) {
  const fromRegs = (registrations || []).map((team) => ({
    key: `reg-${team.id}`,
    label: team.team_name,
    registration_id: team.id,
  }));
  const names = new Set(fromRegs.map((team) => team.label.toLowerCase()));
  const extraClubs = (clubs || [])
    .filter((club) => !names.has(club.name.toLowerCase()))
    .map((club) => ({
      key: `club-${club.id}`,
      label: club.name,
      team_id: club.id,
    }));
  return [...fromRegs, ...extraClubs];
}

function nextMatchday(matches) {
  return (matches || []).reduce((max, match) => Math.max(max, Number(match.matchday) || 0), 0) + 1;
}

function toDatetimeLocal(value) {
  if (!value) return '';
  return String(value).replace(' ', 'T').slice(0, 16);
}

function payloadFromKey(key, side) {
  if (!key) return {};
  if (key.startsWith('reg-')) return { [`${side}_registration_id`]: Number(key.slice(4)) };
  if (key.startsWith('club-')) return { [`${side}_team_id`]: Number(key.slice(5)) };
  return {};
}

function matchTeamKey(match, side, options) {
  const name = side === 'home' ? match.home_team : match.away_team;
  const id = side === 'home' ? match.home_team_id : match.away_team_id;
  const byReg = options.find((option) => option.registration_id && option.label === name);
  if (byReg) return byReg.key;
  const byClub = options.find((option) => option.team_id === id);
  return byClub ? byClub.key : `club-${id}`;
}

function FixtureForm({ options, nextMatchday: matchdayDefault, busy, onCreate }) {
  const [home, setHome] = useState(options[0]?.key || '');
  const [away, setAway] = useState(options[1]?.key || '');
  const [kickoff, setKickoff] = useState('');
  const [venue, setVenue] = useState('Manjappada Ground');
  const [matchday, setMatchday] = useState(matchdayDefault || 1);

  useEffect(() => {
    setMatchday(matchdayDefault || 1);
  }, [matchdayDefault]);

  useEffect(() => {
    if (!home && options[0]) setHome(options[0].key);
    if (!away && options[1]) setAway(options[1].key);
  }, [options, home, away]);

  if (!options.length) {
    return <p className="muted">Register at least two teams before making fixtures.</p>;
  }

  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onCreate({
          ...payloadFromKey(home, 'home'),
          ...payloadFromKey(away, 'away'),
          kickoff_at: kickoff,
          venue,
          matchday: Number(matchday),
          status: 'scheduled',
        });
      }}
    >
      <label>
        Home team
        <select value={home} onChange={(e) => setHome(e.target.value)} required>
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Away team
        <select value={away} onChange={(e) => setAway(e.target.value)} required>
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Kickoff
        <input type="datetime-local" value={kickoff} onChange={(e) => setKickoff(e.target.value)} required />
      </label>
      <label>
        Venue
        <input value={venue} onChange={(e) => setVenue(e.target.value)} required />
      </label>
      <label>
        Matchday
        <input
          type="number"
          min="1"
          value={matchday}
          onChange={(e) => setMatchday(e.target.value)}
          required
        />
      </label>
      <div className="form-span">
        <button type="submit" className="btn btn-primary" disabled={busy || options.length < 2}>
          Add fixture
        </button>
      </div>
    </form>
  );
}

function FixtureRow({ match, options, busy, onSave, onDelete }) {
  const [home, setHome] = useState(matchTeamKey(match, 'home', options));
  const [away, setAway] = useState(matchTeamKey(match, 'away', options));
  const [kickoff, setKickoff] = useState(toDatetimeLocal(match.kickoff_at));
  const [venue, setVenue] = useState(match.venue || '');
  const [matchday, setMatchday] = useState(match.matchday || 1);
  const [homeScore, setHomeScore] = useState(match.home_score ?? '');
  const [awayScore, setAwayScore] = useState(match.away_score ?? '');
  const [status, setStatus] = useState(match.status || 'scheduled');

  useEffect(() => {
    setHome(matchTeamKey(match, 'home', options));
    setAway(matchTeamKey(match, 'away', options));
    setKickoff(toDatetimeLocal(match.kickoff_at));
    setVenue(match.venue || '');
    setMatchday(match.matchday || 1);
    setHomeScore(match.home_score ?? '');
    setAwayScore(match.away_score ?? '');
    setStatus(match.status || 'scheduled');
  }, [match, options]);

  return (
    <form
      className="admin-fixture"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          ...payloadFromKey(home, 'home'),
          ...payloadFromKey(away, 'away'),
          kickoff_at: kickoff,
          venue,
          matchday: Number(matchday),
          home_score: homeScore === '' ? null : Number(homeScore),
          away_score: awayScore === '' ? null : Number(awayScore),
          status,
        });
      }}
    >
      <div className="form-grid">
        <label>
          Home team
          <select value={home} onChange={(e) => setHome(e.target.value)}>
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Away team
          <select value={away} onChange={(e) => setAway(e.target.value)}>
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kickoff
          <input type="datetime-local" value={kickoff} onChange={(e) => setKickoff(e.target.value)} required />
        </label>
        <label>
          Venue
          <input value={venue} onChange={(e) => setVenue(e.target.value)} required />
        </label>
        <label>
          Matchday
          <input
            type="number"
            min="1"
            value={matchday}
            onChange={(e) => setMatchday(e.target.value)}
            required
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="scheduled">scheduled</option>
            <option value="live">live</option>
            <option value="finished">finished</option>
            <option value="postponed">postponed</option>
          </select>
        </label>
        <label>
          Home score
          <input
            type="number"
            min="0"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          Away score
          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="—"
          />
        </label>
      </div>
      <div className="cta-row">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          Save fixture
        </button>
        <button type="button" className="chip" disabled={busy} onClick={onDelete}>
          Remove
        </button>
      </div>
    </form>
  );
}
