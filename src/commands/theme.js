'use strict';

const path = require('path');
const fs = require('fs-extra');
const { createLogger } = require('../utils/logger');

/**
 * Theme command handler
 */

const THEMES = [
  'cobalt', 'green', 'blue', 'purple', 
  'orange', 'red', 'nord', 'everforest', 'gruvbox', 'cream'
];

const THEME_AUTO_RULES = {
  '*dev*': 'green',
  '*code*': 'green',
  '*research*': 'blue',
  '*doc*': 'blue',
  '*debug*': 'orange',
  '*test*': 'orange',
  '*prod*': 'red',
  '*urgent*': 'red'
};

/**
 * Apply tmux theme
 */
async function theme(themeName, sessionName, options = {}, scriptDir) {
  try {
    // Initialize
    const logger = createLogger({
      silent: false,
      verbose: options.verbose || false
    });

    // List themes if requested
    if (options.list) {
      displayThemeList(logger);
      return;
    }

    // Validate theme name
    if (!themeName) {
      throw new Error('Theme name is required. Use --list to see available themes.');
    }

    const normalizedTheme = themeName.toLowerCase();
    if (!THEMES.includes(normalizedTheme)) {
      throw new Error(`Unknown theme: ${themeName}. Use --list to see available themes.`);
    }

    // Resolve session
    const session = await resolveSession(sessionName, options.auto);
    if (!session) {
      throw new Error('Could not determine tmux session. Start a tmux session first.');
    }

    logger.info(`Applying theme: ${normalizedTheme}`);
    logger.info(`Target session: ${session}`);

    // Dry run check
    if (options.preview) {
      logger.banner('PREVIEW MODE', 'magenta');
      logger.info(`Would apply theme: ${normalizedTheme}`);
      logger.info(`Target session: ${session}`);
      logger.info('(No changes will be applied)');
      return;
    }

    // Check if tmux themes script exists
    const themeScript = path.join(process.env.HOME, '.tmux', 'themes.sh');
    if (!await fs.pathExists(themeScript)) {
      logger.error('Tmux themes script not found');
      logger.info('Run: zsc update tmux-themes to install themes');
      process.exit(1);
    }

    // Check if we're in tmux
    const { isInTmux } = require('../utils/system');
    if (!isInTmux()) {
      logger.warning('Not currently in a tmux session');
    }

    // Apply theme
    logger.banner('APPLYING THEME', 'cyan');

    const { execute } = require('../utils/system');
    const result = execute(`bash "${themeScript}" ${normalizedTheme} ${session}`);

    if (!result.success) {
      throw new Error(result.stderr || 'Failed to apply theme');
    }

    logger.success(`Theme applied successfully!`);
    logger.info(`Theme: ${normalizedTheme}`);
    logger.info(`Session: ${session}`);

  } catch (error) {
    console.error('\nTheme application failed:', error.message);
    process.exit(1);
  }
}

/**
 * Resolve tmux session
 */
async function resolveSession(sessionName, autoDetect) {
  const { execute, getTmuxSession } = require('../utils/system');

  // Explicit session name
  if (sessionName) {
    return sessionName;
  }

  // Auto-detect
  if (autoDetect) {
    const currentSession = getTmuxSession();
    if (currentSession) {
      return currentSession;
    }
  }

  // List available sessions
  const result = execute('tmux ls -F "#S" 2>/dev/null');
  if (result.success && result.stdout.trim()) {
    const sessions = result.stdout.trim().split('\n');
    
    if (sessions.length === 1) {
      return sessions[0];
    }

    // Multiple sessions - ask user
    const inquirer = require('inquirer');
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'session',
        message: 'Select tmux session:',
        choices: sessions
      }
    ]);

    return answer.session;
  }

  return null;
}

/**
 * Display available themes
 */
function displayThemeList(logger) {
  logger.section('Available Themes');

  const tableHeaders = ['Theme', 'Description', 'Auto-trigger'];
  const tableRows = [
    ['cobalt', 'Blue/gray professional theme', 'N/A'],
    ['green', 'Green development theme', '*dev*, *code*'],
    ['blue', 'Blue research theme', '*research*, *doc*'],
    ['purple', 'Purple calm theme', 'N/A'],
    ['orange', 'Orange warning theme', '*debug*, *test*'],
    ['red', 'Red urgent theme', '*prod*, *urgent*'],
    ['nord', 'Nord dark theme', 'N/A'],
    ['everforest', 'Everforest green theme', 'N/A'],
    ['gruvbox', 'Gruvbox retro theme', 'N/A'],
    ['cream', 'Cream light theme', 'N/A']
  ];

  logger.table(tableHeaders, tableRows);

  console.log('\nUsage:');
  console.log('  zsc theme <name> [session]    - Apply specific theme');
  console.log('  zsc theme --auto               - Auto-detect session');
  console.log('  zsc theme --list              - List all themes');
  console.log('\nAuto-theming (based on session name):');
  
  for (const [pattern, theme] of Object.entries(THEME_AUTO_RULES)) {
    console.log(`  ${pattern.padEnd(20)} → ${theme}`);
  }
}

/**
 * Get auto theme for session
 */
function getAutoTheme(sessionName) {
  if (!sessionName) return null;

  const lowerName = sessionName.toLowerCase();
  for (const [pattern, theme] of Object.entries(THEME_AUTO_RULES)) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    if (regex.test(lowerName)) {
      return theme;
    }
  }

  return 'cobalt'; // Default
}

module.exports = { theme };
