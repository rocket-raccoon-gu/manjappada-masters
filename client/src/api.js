const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'mmfl_admin_token';
const TEAM_TOKEN_KEY = 'mmfl_team_token';

export function getAdminToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAdminToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function getTeamToken() {
  try {
    return sessionStorage.getItem(TEAM_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setTeamToken(token) {
  try {
    if (token) sessionStorage.setItem(TEAM_TOKEN_KEY, token);
    else sessionStorage.removeItem(TEAM_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json();
}

async function adminRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function teamRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTeamToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  tournament: () => request('/api/tournament'),
  teams: () => request('/api/teams'),
  team: (id) => request(`/api/teams/${id}`),
  matches: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/matches${query ? `?${query}` : ''}`);
  },
  match: (id) => request(`/api/matches/${id}`),
  standings: () => request('/api/standings'),
  scorers: () => request('/api/players/scorers'),
  health: () => request('/api/health'),
  settings: () => request('/api/settings'),
  registrations: () => request('/api/registrations'),
  registration: (id) => request(`/api/registrations/${id}`),
  registerTeam: async (payload) => {
    let response;
    try {
      response = await fetch(`${API_BASE}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('Network error while submitting. Check your connection and try again.');
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 413) {
        throw new Error('Upload is too large. Please use a smaller payment receipt screenshot.');
      }
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return response.json();
  },
  teamLogin: async (username, password) => {
    const response = await fetch(`${API_BASE}/api/team/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data;
  },
  teamMe: () => teamRequest('/api/team/me'),
  addTeamPlayer: (body) => teamRequest('/api/team/me/players', { method: 'POST', body }),
  updateTeamPlayer: (id, body) =>
    teamRequest(`/api/team/me/players/${id}`, { method: 'PATCH', body }),
  deleteTeamPlayer: (id) => teamRequest(`/api/team/me/players/${id}`, { method: 'DELETE' }),
  adminLogin: (password) =>
    fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Login failed');
      return data;
    }),
  setRegistrationOpen: (registration_open) =>
    adminRequest('/api/admin/settings', { method: 'PATCH', body: { registration_open } }),
  adminRegistration: (id) => adminRequest(`/api/admin/registrations/${id}`),
  updateRegistration: (id, body) =>
    adminRequest(`/api/admin/registrations/${id}`, { method: 'PATCH', body }),
  deleteRegistration: (id) =>
    adminRequest(`/api/admin/registrations/${id}`, { method: 'DELETE' }),
  updatePlayer: (id, body) => adminRequest(`/api/admin/players/${id}`, { method: 'PATCH', body }),
  deletePlayer: (id) => adminRequest(`/api/admin/players/${id}`, { method: 'DELETE' }),
  updateMatchScore: (id, body) =>
    adminRequest(`/api/matches/${id}/score`, { method: 'PATCH', body }),
  createMatch: (body) => adminRequest('/api/admin/matches', { method: 'POST', body }),
  updateMatch: (id, body) => adminRequest(`/api/admin/matches/${id}`, { method: 'PATCH', body }),
  deleteMatch: (id) => adminRequest(`/api/admin/matches/${id}`, { method: 'DELETE' }),
};
