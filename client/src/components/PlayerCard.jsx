export default function PlayerCard({
  playerName = '',
  dob = '',
  position = '',
  teamName = '',
}) {
  const displayDob = dob
    ? new Date(dob).toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

  return (
    <article className="player-id-card">
      <div className="player-id-card__title">Masters 7&apos;s Football Cup</div>
      <div className="player-id-card__region">Qatar</div>

      <div className="player-id-card__body player-id-card__body--no-photo">
        <div className="player-id-card__meta">
          <div>
            <span className="player-id-card__label">DOB</span>
            <strong>{displayDob}</strong>
          </div>
          <div>
            <span className="player-id-card__label">Team</span>
            <strong>{teamName || '—'}</strong>
          </div>
          <div>
            <span className="player-id-card__label">Position</span>
            <strong>{position || '—'}</strong>
          </div>
        </div>
      </div>

      <div className="player-id-card__name">
        <span className="player-id-card__label">Name</span>
        <strong>{playerName || 'Player name'}</strong>
      </div>
      <div className="player-id-card__footer">Manjappada Qatar</div>
    </article>
  );
}
