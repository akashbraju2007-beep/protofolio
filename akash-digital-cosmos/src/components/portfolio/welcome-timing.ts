export const WELCOME_DURATION_MS = 2000;
export const WELCOME_TIMEOUT_MS = 4500;
export const WELCOME_FADE_MS = 450;

export function shouldRevealWelcome(
  elapsed: number,
  ready: boolean,
  returning: boolean,
  reducedMotion: boolean,
) {
  if (returning || elapsed >= WELCOME_TIMEOUT_MS) return true;
  return ready && elapsed >= (reducedMotion ? 150 : WELCOME_DURATION_MS);
}
