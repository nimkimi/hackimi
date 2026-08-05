import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import pkg from '../../package.json';

const repoRoot = join(__dirname, '..', '..');

// Regression guard for the formatter gate. Prettier drifted 3.6.2 -> 3.8.3
// through its caret range, nobody re-ran `format`, and 69 files silently began
// failing `npm run check` — which CI never ran, so nothing went red. Two
// invariants make that combination impossible to reintroduce: the formatter is
// pinned to one exact version (its output IS its contract, so a range on it is a
// range on every diff), and CI actually runs the check.
describe('formatter gate', () => {
  it('pins prettier to an exact version', () => {
    const prettier = pkg.devDependencies.prettier;

    expect(prettier).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('runs the format check in CI', () => {
    const workflow = readFileSync(join(repoRoot, '.github/workflows/ci.yml'), 'utf8');

    expect(workflow).toMatch(/run:\s*npm run check/);
  });
});

// eslint-config-prettier sat in devDependencies imported by nothing: the old
// .eslintrc.json only ever extended next/core-web-vitals, and the flat config
// that replaced it never referenced it either. `next/core-web-vitals` enables no
// formatting rules and ESLint's core stylistic rules are off by default in v9,
// so it had nothing to turn off. An unreferenced dependency is a small lie about
// what the project uses.
describe('dependency hygiene', () => {
  it('does not carry eslint-config-prettier', () => {
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    } as Record<string, string>;

    expect(allDeps).not.toHaveProperty('eslint-config-prettier');
  });
});
