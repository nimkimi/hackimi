/**
 * Whether to play the signature arrival animation.
 *
 * It plays on every full page load (including refresh) so the entrance is seen
 * each visit; it is skipped only when the user prefers reduced motion (a11y).
 * (In-app client-side navigations don't remount the Preloader, so it does not
 * re-fire on internal link clicks — only on real page loads/refreshes.)
 */
export function shouldPlayIntro(reduceMotion: boolean): boolean {
  return !reduceMotion;
}
