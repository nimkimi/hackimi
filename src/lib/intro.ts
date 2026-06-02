export const INTRO_KEY = 'intro-seen';

/** Whether to play the arrival animation: only when unseen this session AND motion is allowed. */
export function shouldPlayIntro(storage: Storage, reduceMotion: boolean): boolean {
  if (reduceMotion) return false;
  try {
    return storage.getItem(INTRO_KEY) !== '1';
  } catch {
    return false;
  }
}
