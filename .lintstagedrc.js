// `next lint` was removed in Next.js 16, so the old `--file`-per-path wrapper
// is gone with it. The ESLint CLI takes paths positionally, and its flat config
// already scopes which files it will look at.
//
// NOTE: nothing runs this today — lint-staged is not installed and the repo has
// no git hooks. Kept correct rather than deleted so it works if hooks get wired
// up; delete it instead if that is not the plan.
module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],
};
