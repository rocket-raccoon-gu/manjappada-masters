import { useMemo, useState } from 'react';
import { api } from '../api';
import useApi from '../hooks/useApi';
import MatchRow from '../components/MatchRow.jsx';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'scheduled', label: 'Upcoming' },
  { id: 'live', label: 'Live' },
  { id: 'finished', label: 'Results' },
];

export default function Fixtures() {
  const { data, loading, error } = useApi(() => api.matches(), []);
  const [filter, setFilter] = useState('all');

  const matches = useMemo(() => {
    const list = data || [];
    if (filter === 'all') return list;
    return list.filter((m) => m.status === filter);
  }, [data, filter]);

  return (
    <section className="section">
      <div className="container">
        <div className="page-hero">
          <h1>Fixtures</h1>
          <p>Every scheduled kickoff, live game, and finished result in the Club Cup.</p>
        </div>

        <div className="filter-row">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip ${filter === item.id ? 'active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading && <div className="state-box">Loading fixtures…</div>}
        {error && <div className="error-box">{error}</div>}
        {!loading && !error && (
          <div className="match-list">
            {matches.length ? (
              matches.map((match) => <MatchRow key={match.id} match={match} />)
            ) : (
              <p className="muted">No matches in this filter.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
