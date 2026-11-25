/** Must match functions/api MAX_PLAYERS. */
export const MAX_PLAYERS = 12;

export function squadProgress(playerCount) {
  const count = Math.max(0, Number(playerCount) || 0);
  const pct = Math.min(100, Math.round((count / MAX_PLAYERS) * 100));
  const complete = count >= MAX_PLAYERS;
  return {
    count,
    max: MAX_PLAYERS,
    pct,
    complete,
    label: complete
      ? 'Profile updated 100%'
      : `Profile ${pct}% · ${count}/${MAX_PLAYERS} players`,
  };
}
