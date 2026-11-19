import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import useApi from '../hooks/useApi';
import { compressImage } from '../utils/image.js';

const initialTeam = {
  team_name: '',
  manager_name: '',
  contact_number: '',
  email: '',
  captain_name: '',
  captain_mobile: '',
  captain_email: '',
  team_logo: '',
  payment_receipt: '',
  password: '',
  password_confirm: '',
};

export default function Register() {
  const settings = useApi(() => api.settings(), []);
  const registrationOpen = settings.data?.registration_open !== false;
  const [team, setTeam] = useState(initialTeam);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  function updateTeam(field, value) {
    setTeam((prev) => ({ ...prev, [field]: value }));
  }

  async function onImageChange(field, event, options) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const photo = await compressImage(file, options);
      updateTeam(field, photo);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess(null);

    if (!agreedToRules) {
      setError('Please agree to the Rules & Regulations before submitting.');
      return;
    }
    if (!team.payment_receipt) {
      setError('Please upload a screenshot of the payment receipt.');
      return;
    }
    if (!team.password || team.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (team.password !== team.password_confirm) {
      setError('Password confirmation does not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.registerTeam({
        team_name: team.team_name,
        manager_name: team.manager_name,
        contact_number: team.contact_number,
        email: team.email,
        captain_name: team.captain_name,
        captain_mobile: team.captain_mobile,
        captain_email: team.captain_email,
        team_logo: team.team_logo || null,
        payment_receipt: team.payment_receipt,
        password: team.password,
        accepted_rules: true,
      });
      setSuccess(result);
      setTeam(initialTeam);
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

  if (success) {
    return (
      <section className="section">
        <div className="container">
          <div className="page-hero">
            <h1>Registration received</h1>
            <p>
              Team <strong>{success.username}</strong> is saved. Your username is the team name —
              log in anytime to add or edit players (up to 12).
            </p>
          </div>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/team">
              Team login
            </Link>
            <button type="button" className="btn btn-ghost on-light" onClick={() => setSuccess(null)}>
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
            Register manager, captain, and payment receipt first. Add player ID cards later after
            you log in with your team name.
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
                <span className="field-hint">This will also be your login username.</span>
              </label>
              <label>
                Team Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onImageChange('team_logo', e, {
                      maxWidth: 640,
                      quality: 0.88,
                      preserveTransparency: true,
                    })
                  }
                />
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
                    placeholder="Digits only"
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
                    placeholder="Digits only"
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
            <h2>Payment receipt</h2>
            <p className="muted">
              Upload a clear screenshot of the registration fee payment receipt.
            </p>
            <div className="form-grid">
              <label className="form-span">
                Receipt screenshot
                <input
                  required
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onImageChange('payment_receipt', e, { maxWidth: 1200, quality: 0.78 })
                  }
                />
              </label>
            </div>
            {team.payment_receipt && (
              <div className="logo-preview receipt-preview">
                <img src={team.payment_receipt} alt="Payment receipt preview" />
              </div>
            )}
          </div>

          <div className="register-panel">
            <h2>Team login</h2>
            <p className="muted">
              Create a password below. Your username is your team name (change it in Team details
              above) — use both later to add players.
            </p>
            <div className="form-grid">
              <div className="username-readonly form-span">
                <span className="username-readonly-label">Username (from team name)</span>
                <p className="username-readonly-value">
                  {team.team_name.trim() || 'Enter a team name above'}
                </p>
              </div>
              <label>
                Password
                <input
                  required
                  type="password"
                  minLength={6}
                  value={team.password}
                  onChange={(e) => updateTeam('password', e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
              </label>
              <label>
                Confirm password
                <input
                  required
                  type="password"
                  minLength={6}
                  value={team.password_confirm}
                  onChange={(e) => updateTeam('password_confirm', e.target.value)}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                />
              </label>
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
            <Link className="btn btn-ghost on-light" to="/team">
              Already registered? Team login
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
