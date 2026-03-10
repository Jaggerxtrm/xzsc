#!/usr/bin/env node

'use strict';

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

// Package root – one level above this file (bin/cli.js → project root)
const SCRIPT_DIR = path.join(__dirname, '..');
const installScript = path.join(SCRIPT_DIR, 'install.sh');
const themesScript = path.join(os.homedir(), '.tmux', 'themes.sh');

// ---------------------------------------------------------------------------
// Valid component / theme names
// ---------------------------------------------------------------------------

const COMPONENTS = ['eza', 'tmux', 'starship', 'fonts', 'zshrc', 'omz', 'plugins', 'statusline', 'tools'];
const THEMES = ['cobalt', 'green', 'blue', 'purple', 'orange', 'red', 'nord', 'everforest', 'gruvbox', 'cream'];

// ---------------------------------------------------------------------------
// Usage text
// ---------------------------------------------------------------------------

const USAGE = `
Usage: zsc <command> [options]

Commands:
  install                   Full install (zsh, starship, tmux, eza, fonts...)
  update [component]        Update all components, or a specific one
  theme <name> [session]    Apply a tmux colour theme to a session
  status                    Show installed versions and health check
  help                      Show this help

Components (for update):
  eza  tmux  starship  fonts  zshrc  omz  plugins  statusline  tools

Themes (for theme):
  cobalt  green  blue  purple  orange  red  nord  everforest  gruvbox  cream

Examples:
  zsc install
  zsc update
  zsc update eza
  zsc theme nord
  zsc theme cobalt myproject
  zsc status
`.trimStart();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Ensure install.sh is executable, then spawn it with the given extra args.
 * Exits with the child process exit code.
 *
 * @param {string[]} extraArgs - Arguments appended after the script path.
 */
function runInstallScript(extraArgs) {
  // Make the script executable before every invocation so freshly-cloned
  // repos or downloaded tarballs work out of the box.
  try {
    fs.chmodSync(installScript, 0o755);
  } catch (err) {
    console.error(`Error: cannot chmod install.sh: ${err.message}`);
    process.exit(1);
  }

  if (!fs.existsSync(installScript)) {
    console.error(`Error: install.sh not found at ${installScript}`);
    process.exit(1);
  }

  const child = spawn(installScript, extraArgs, {
    stdio: 'inherit',
    cwd: SCRIPT_DIR,
    env: process.env,
  });

  child.on('error', (err) => {
    console.error(`Error: failed to start install.sh: ${err.message}`);
    process.exit(1);
  });

  child.on('close', (code) => {
    process.exit(code ?? 1);
  });
}

/**
 * Resolve the tmux session name to use for `zsc theme`.
 *
 * Priority:
 *  1. Explicitly provided on the CLI (`zsc theme cobalt mysession`).
 *  2. If inside tmux ($TMUX is set), query the current session name.
 *  3. Fall back to the first session listed by `tmux ls`.
 *
 * Returns null (with an error already printed) if no session can be found.
 *
 * @param {string|undefined} explicitSession
 * @returns {string|null}
 */
function resolveTmuxSession(explicitSession) {
  // 1. Caller supplied a session name directly.
  if (explicitSession) {
    return explicitSession;
  }

  // 2. Running inside tmux – ask tmux for the current session name.
  if (process.env.TMUX) {
    const result = spawnSync('tmux', ['display-message', '-p', '#S'], {
      encoding: 'utf8',
    });
    if (result.status === 0 && result.stdout.trim()) {
      return result.stdout.trim();
    }
  }

  // 3. Not in tmux – use the first available session.
  const result = spawnSync('tmux', ['ls', '-F', '#S'], {
    encoding: 'utf8',
  });

  if (result.error) {
    // tmux binary not found or no server running.
    console.error('Error: tmux is not running or not installed. Start a tmux session first.');
    return null;
  }

  if (result.status !== 0 || !result.stdout.trim()) {
    console.error('Error: no tmux sessions found. Start a tmux session first.');
    return null;
  }

  // Take the first session name from the list.
  const firstSession = result.stdout.trim().split('\n')[0];
  return firstSession;
}

// ---------------------------------------------------------------------------
// Subcommand handlers
// ---------------------------------------------------------------------------

/** zsc install → install.sh (no extra args) */
function cmdInstall() {
  runInstallScript([]);
}

/**
 * zsc update [component]
 *   → install.sh --update
 *   → install.sh --update --only <component>
 */
function cmdUpdate(component) {
  if (component !== undefined && !COMPONENTS.includes(component)) {
    console.error(`Error: unknown component "${component}".`);
    console.error(`Valid components: ${COMPONENTS.join(', ')}`);
    process.exit(1);
  }

  const args = ['--update'];
  if (component) {
    args.push('--only', component);
  }

  runInstallScript(args);
}

/**
 * zsc theme <name> [session]
 *   → bash ~/.tmux/themes.sh <name> <session>
 */
function cmdTheme(theme, sessionArg) {
  if (!theme) {
    console.error('Error: theme name is required.');
    console.error(`Valid themes: ${THEMES.join(', ')}`);
    process.exit(1);
  }

  if (!THEMES.includes(theme)) {
    console.error(`Error: unknown theme "${theme}".`);
    console.error(`Valid themes: ${THEMES.join(', ')}`);
    process.exit(1);
  }

  if (!fs.existsSync(themesScript)) {
    console.error(`Error: themes script not found at ${themesScript}`);
    console.error('Run "zsc install" first to set up the tmux theme system.');
    process.exit(1);
  }

  const session = resolveTmuxSession(sessionArg);
  if (!session) {
    // resolveTmuxSession already printed the error.
    process.exit(1);
  }

  const child = spawn('bash', [themesScript, theme, session], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('error', (err) => {
    console.error(`Error: failed to run themes.sh: ${err.message}`);
    process.exit(1);
  });

  child.on('close', (code) => {
    process.exit(code ?? 1);
  });
}

/** zsc status → install.sh --status */
function cmdStatus() {
  runInstallScript(['--status']);
}

/** zsc help (or no args) */
function cmdHelp() {
  process.stdout.write(USAGE);
}

// ---------------------------------------------------------------------------
// Argument parsing & dispatch
// ---------------------------------------------------------------------------

const [, , subcommand, ...rest] = process.argv;

switch (subcommand) {
  case 'install':
    cmdInstall();
    break;

  case 'update':
    // rest[0] is the optional component name
    cmdUpdate(rest[0]);
    break;

  case 'theme':
    // rest[0] = theme name, rest[1] = optional session name
    cmdTheme(rest[0], rest[1]);
    break;

  case 'status':
    cmdStatus();
    break;

  case 'help':
  case '--help':
  case '-h':
    cmdHelp();
    break;

  case undefined:
  default:
    // Unknown or missing subcommand – print usage and exit non-zero.
    if (subcommand) {
      console.error(`Error: unknown command "${subcommand}".`);
    }
    cmdHelp();
    process.exit(subcommand ? 1 : 0);
}
