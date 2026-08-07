const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
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
};
