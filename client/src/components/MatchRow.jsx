function formatKickoff(value) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MatchRow({ match }) {
  const score =
    match.status === 'finished' || match.status === 'live'
      ? `${match.home_score ?? 0} – ${match.away_score ?? 0}`
      : 'vs';

  return (
    <article className="match-row">
      <div className="team-side">
        <span className="crest" style={{ background: match.home_color || '#0B3D2E' }}>
          {match.home_short}
        </span>
        <span>{match.home_team}</span>
      </div>

      <div className="score-block">
        <strong>{score}</strong>
        <small>
          {match.status === 'live' ? 'Live' : formatKickoff(match.kickoff_at)}
        </small>
      </div>

      <div className="team-side away">
        <span>{match.away_team}</span>
        <span className="crest" style={{ background: match.away_color || '#1A3A5C' }}>
          {match.away_short}
        </span>
      </div>
    </article>
  );
}
