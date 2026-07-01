// Shared helpers for the scripts in this folder.
// Zero dependencies — uses only Node built-ins.

import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, '..');

// ANSI color helpers. Disabled when output isn't a TTY or NO_COLOR is set.
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (open, close) => (s) =>
  useColor ? `\x1b[${open}m${s}\x1b[${close}m` : String(s);
export const c = {
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  cyan: wrap(36, 39),
  gray: wrap(90, 39),
};

// Print helpers
export const log = {
  info: (msg) => console.log(`${c.cyan('>')} ${msg}`),
  ok: (msg) => console.log(`${c.green('OK')} ${msg}`),
  warn: (msg) => console.log(`${c.yellow('!')} ${msg}`),
  fail: (msg) => console.error(`${c.red('X')} ${msg}`),
  step: (msg) => console.log(`\n${c.bold(c.blue('->'))} ${c.bold(msg)}`),
  hr: () => console.log(c.gray('-'.repeat(60))),
};

// Run a command, optionally capturing output. Throws on non-zero exit.
export function run(cmd, args, opts = {}) {
  const {
    silent = false,
    cwd = ROOT,
    env = process.env,
    allowFail = false,
    shell = false,
  } = opts;
  // Node's DEP0190: shell:true plus a populated args array silently joins
  // them with bare spaces and no quoting, so one logical argument containing
  // a space (a commit message, a `git for-each-ref` format string) splits
  // into multiple shell words. git.exe/node.exe are real executables and
  // never needed a shell; only npm's Windows .cmd shim does. Callers that
  // opt into `shell` get the whole command pre-joined into a single string
  // with an empty args array instead - only safe because every current
  // shell:true call site uses space-free arguments.
  const useShell = shell && process.platform === 'win32';
  const spawnCmd = useShell ? [cmd, ...args].join(' ') : cmd;
  const spawnArgs = useShell ? [] : args;
  return new Promise((resolveCmd, rejectCmd) => {
    const child = spawn(spawnCmd, spawnArgs, {
      cwd,
      env,
      stdio: silent ? 'pipe' : 'inherit',
      shell: useShell,
    });
    let stdoutBuf = '';
    let stderrBuf = '';
    if (silent) {
      child.stdout?.on('data', (d) => (stdoutBuf += d.toString()));
      child.stderr?.on('data', (d) => (stderrBuf += d.toString()));
    }
    child.on('close', (code) => {
      if (code === 0 || allowFail) {
        resolveCmd({ code, stdout: stdoutBuf, stderr: stderrBuf });
      } else {
        const err = new Error(
          `Command failed (${code}): ${cmd} ${args.join(' ')}`
        );
        err.code = code;
        err.stdout = stdoutBuf;
        err.stderr = stderrBuf;
        rejectCmd(err);
      }
    });
    child.on('error', rejectCmd);
  });
}

// Convenience wrappers for git commands. All run from ROOT.
export const git = {
  capture: async (...args) =>
    (await run('git', args, { silent: true })).stdout.trim(),
  status: () => git.capture('status', '--porcelain'),
  branch: () => git.capture('rev-parse', '--abbrev-ref', 'HEAD'),
  remote: () => git.capture('remote', 'get-url', 'origin'),
  isClean: async () => (await git.status()) === '',
  fetch: () => run('git', ['fetch', 'origin', '--prune']),
  push: (...args) => run('git', ['push', ...args]),
  ahead: async (a, b) =>
    (await git.capture('rev-list', '--count', `${b}..${a}`)) | 0,
  behind: async (a, b) =>
    (await git.capture('rev-list', '--count', `${a}..${b}`)) | 0,
};

// Read package.json once, cache it.
let pkgCache;
export async function readPkg() {
  if (pkgCache) return pkgCache;
  const text = await readFile(resolve(ROOT, 'package.json'), 'utf8');
  pkgCache = { json: JSON.parse(text), text };
  return pkgCache;
}

export async function writePkg(json) {
  // Preserve trailing newline that npm/most tools expect.
  const text = JSON.stringify(json, null, 2) + '\n';
  await writeFile(resolve(ROOT, 'package.json'), text, 'utf8');
  pkgCache = { json, text };
}

// Read CHANGELOG.md
export async function readChangelog() {
  const path = resolve(ROOT, 'CHANGELOG.md');
  if (!existsSync(path)) return null;
  return readFile(path, 'utf8');
}

export async function writeChangelog(content) {
  await writeFile(resolve(ROOT, 'CHANGELOG.md'), content, 'utf8');
}

// Interactive prompt. Honors --yes / -y to skip.
const SKIP_PROMPTS =
  process.argv.includes('--yes') || process.argv.includes('-y');
export async function confirm(question, defaultYes = true) {
  if (SKIP_PROMPTS) return true;
  const rl = createInterface({ input: stdin, output: stdout });
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  const ans = (await rl.question(`${c.cyan('?')} ${question} ${hint} `))
    .trim()
    .toLowerCase();
  rl.close();
  if (!ans) return defaultYes;
  return ans === 'y' || ans === 'yes';
}

export async function ask(question, defaultValue = '') {
  if (SKIP_PROMPTS) return defaultValue;
  const rl = createInterface({ input: stdin, output: stdout });
  const hint = defaultValue ? c.dim(` (${defaultValue})`) : '';
  const ans = (await rl.question(`${c.cyan('?')} ${question}${hint} `)).trim();
  rl.close();
  return ans || defaultValue;
}

// Bumps a semver string. type in "major" | "minor" | "patch".
export function bumpVersion(version, type) {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!m) throw new Error(`Invalid semver: ${version}`);
  let [, major, minor, patch] = m;
  major = +major;
  minor = +minor;
  patch = +patch;
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unknown bump type: ${type}`);
  }
}

// Get today's date as YYYY-MM-DD (UTC).
export function today() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Print a usage block and exit.
export function usage(text) {
  console.log(text.trim());
  process.exit(0);
}

// Wrap an async main and exit with a clean error message.
export function main(fn) {
  fn().catch((err) => {
    log.fail(err.message || String(err));
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(err.code || 1);
  });
}
