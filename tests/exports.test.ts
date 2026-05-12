/**
 * Packaging integrity tests.
 *
 * After running the build, every file path declared in package.json's
 * `main`, `module`, `types`, and `exports` fields MUST exist on disk in
 * `dist/`. If any path is wrong, modern Node and TypeScript resolvers
 * (under moduleResolution `node16`/`nodenext`/`bundler`) silently fall
 * back to `any` types or fail at runtime.
 *
 * The build is run lazily once per test file (via `npm run build` is
 * expected to have been invoked by the developer or CI ahead of time).
 * If `dist/` is missing, the suite gives a helpful error instead of a
 * cryptic ENOENT.
 *
 * The CJS smoke check also asserts the canonical require shape: a
 * `const useSEO = require('@hiprax/use-seo')` call must return the hook
 * function directly with named exports attached as properties — not a
 * `{ default, useSEO, ... }` namespace object.
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';

const ROOT = resolve(__dirname, '..');
const PKG_PATH = resolve(ROOT, 'package.json');
const DIST_DIR = resolve(ROOT, 'dist');

interface PackageJsonExportConditions {
  [condition: string]:
    | string
    | PackageJsonExportConditions
    | Array<string | PackageJsonExportConditions>
    | undefined;
}

interface PackageJson {
  main?: string;
  module?: string;
  types?: string;
  typings?: string;
  exports?:
    | string
    | PackageJsonExportConditions
    | Record<string, string | PackageJsonExportConditions>;
}

function readPackageJson(): PackageJson {
  const raw = readFileSync(PKG_PATH, 'utf8');
  return JSON.parse(raw) as PackageJson;
}

/**
 * Recursively walk an `exports` value and collect every file path string.
 * Handles nested condition maps and string-array fallbacks per the
 * Node.js conditional exports spec.
 */
function collectExportPaths(
  value:
    | string
    | PackageJsonExportConditions
    | Array<string | PackageJsonExportConditions>
    | undefined
): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectExportPaths(item));
  }
  return Object.values(value).flatMap((nested) => collectExportPaths(nested));
}

function resolveRelativeToRoot(p: string): string {
  // Strip the leading "./" if present, then resolve from project root.
  return resolve(ROOT, p.replace(/^\.\//, ''));
}

describe('Packaging integrity', () => {
  const pkg = readPackageJson();

  it('dist/ exists (run `npm run build` first)', () => {
    expect(existsSync(DIST_DIR)).toBe(true);
    expect(statSync(DIST_DIR).isDirectory()).toBe(true);
  });

  describe('top-level path fields', () => {
    const topLevel: Array<keyof PackageJson> = [
      'main',
      'module',
      'types',
      'typings',
    ];
    topLevel.forEach((field) => {
      const value = pkg[field];
      if (typeof value === 'string') {
        it(`package.json#${field} (${value}) resolves to a real file`, () => {
          const abs = resolveRelativeToRoot(value);
          expect(existsSync(abs)).toBe(true);
          expect(statSync(abs).isFile()).toBe(true);
        });
      }
    });
  });

  describe('exports field paths', () => {
    const paths = Array.from(new Set(collectExportPaths(pkg.exports)));

    it('collects at least one path from exports', () => {
      expect(paths.length).toBeGreaterThan(0);
    });

    paths.forEach((relPath) => {
      it(`package.json#exports references a real file: ${relPath}`, () => {
        const abs = resolveRelativeToRoot(relPath);
        expect(existsSync(abs)).toBe(true);
        expect(statSync(abs).isFile()).toBe(true);
        // dist should contain the file (no escapes outside dist)
        expect(dirname(abs).startsWith(DIST_DIR)).toBe(true);
      });
    });
  });

  describe('CJS bundle interop', () => {
    const cjsPath = resolveRelativeToRoot('./dist/index.cjs');

    it('exists', () => {
      expect(existsSync(cjsPath)).toBe(true);
    });

    it('require() returns the useSEO function directly with named exports attached', () => {
      // Use an isolated require so jest's module cache doesn't interfere.
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mod = require(cjsPath) as unknown;
        expect(typeof mod).toBe('function');
        const ns = mod as Record<string, unknown> &
          ((...args: unknown[]) => unknown);
        expect(typeof ns.useSEO).toBe('function');
        expect(ns.useSEO).toBe(mod);
        // Default property still resolves to the same function for ESM-interop consumers.
        expect(ns.default).toBe(mod);
        // Named constants are attached as properties.
        expect(ns.DEFAULT_OG_TYPE).toBe('website');
        expect(ns.MIN_TITLE_LENGTH).toBe(30);
      });
    });
  });
});
