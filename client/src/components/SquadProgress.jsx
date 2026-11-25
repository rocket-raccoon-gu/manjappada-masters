import { squadProgress } from '../utils/squad.js';

export default function SquadProgress({ playerCount, hint = '' }) {
  const progress = squadProgress(playerCount);

  return (
    <div
      className={
        progress.complete ? 'squad-progress squad-progress--complete' : 'squad-progress'
      }
    >
      <div
        className="squad-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.pct}
        aria-label={progress.label}
      >
        <span className="squad-progress__fill" style={{ width: `${progress.pct}%` }} />
      </div>
      <p className="squad-progress__label">
        {progress.label}
        {hint && !progress.complete ? ` ${hint}` : ''}
      </p>
    </div>
  );
}
