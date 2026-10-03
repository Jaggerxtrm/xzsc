'use strict';

const path = require('path');
const fs = require('fs-extra');
const { createLogger } = require('../utils/logger');

const THEMES = [
  'black', 'transparent', 'graphite', 'retrogreen', 'cobalt', 'green', 'green2',
  'blue', 'purple', 'orange', 'red', 'nord', 'everforest', 'gruvbox',
  'paper', 'lcobalt', 'lgreen', 'lblue', 'lpurple', 'lorange', 'lred',
  'lnord', 'leverforest', 'lgruvbox'
];

const THEME_AUTO_RULES = {
  '*black*': 'black',
  '*trueblack*': 'black',
  '*transparent*': 'transparent',
  '*clear*': 'transparent',
  '*green2*': 'green2',
  '*brightgreen*': 'green2',
  '*bright-green*': 'green2',
  '*dev*': 'green',
  '*code*': 'green',
  '*research*': 'blue',
  '*doc*': 'blue',
  '*debug*': 'orange',
  '*test*': 'orange',
  '*prod*': 'red',
  '*urgent*': 'red'
};

async function theme(themeName, sessionName, options = {}) {
  try {
    const logger = createLogger({
      silent: false,
      verbose: options.verbose || false
    });

    if (options.list) {
      displayThemeList(logger);
      return;
    }

    if (!themeName) {
      throw new Error('Theme name is required. Use --list to see available themes.');
    }

    const normalizedTheme = themeName.toLowerCase();
    if (!THEMES.includes(normalizedTheme)) {
      throw new Error(`Unknown theme: ${themeName}. Use --list to see available themes.`);
    }

    const session = await resolveSession(sessionName, options.auto);
    if (!session) {
      throw new Error('Could not determine tmux session. Start a tmux session first.');
    }

    logger.info(`Applying theme: ${normalizedTheme}`);
    logger.info(`Target session: ${session}`);

    if (options.preview) {
      logger.banner('PREVIEW MODE', 'magenta');
      logger.info(`Would apply theme: ${normalizedTheme}`);
      logger.info(`Target session: ${session}`);
      return;
    }

    const themeScript = path.join(process.env.HOME, '.tmux', 'themes.sh');
    if (!await fs.pathExists(themeScript)) {
      logger.error('Tmux themes script not found');
      logger.info('Run: zsc update tmuxThemes');
      process.exit(1);
    }

    const { execute } = require('../utils/system');
    const barStyle = normalizedTheme === 'retrogreen' ? 'theme' : 'inverse';
    const result = execute(`bash "${themeScript}" ${normalizedTheme} ${session} ${barStyle}`);
    if (!result.success) {
      throw new Error(result.stderr || 'Failed to apply theme');
    }

    logger.success('Theme applied successfully');
  } catch (error) {
    console.error('\nTheme application failed:', error.message);
    process.exit(1);
  }
}

async function resolveSession(sessionName, autoDetect) {
  const { execute, getTmuxSession } = require('../utils/system');

  if (sessionName) return sessionName;

  if (autoDetect) {
    const currentSession = getTmuxSession();
    if (currentSession) return currentSession;
  }

  const result = execute('tmux ls -F "#S" 2>/dev/null');
  if (result.success && result.stdout.trim()) {
    const sessions = result.stdout.trim().split('\n');
    if (sessions.length === 1) return sessions[0];

    const inquirer = require('inquirer');
    const prompt = inquirer.prompt || inquirer.default?.prompt;
    if (!prompt) {
      throw new Error('Interactive prompts are unavailable (inquirer import failed).');
    }

    const answer = await prompt([
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

function getAutoTheme(sessionName) {
  if (!sessionName) return 'graphite';

  const lowerName = sessionName.toLowerCase();
  for (const [pattern, themeName] of Object.entries(THEME_AUTO_RULES)) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    if (regex.test(lowerName)) return themeName;
  }

  return 'cobalt';
}

function displayThemeList(logger) {
  logger.section('Available Themes');

  const tableHeaders = ['Theme', 'Description', 'Auto-trigger'];
  const tableRows = [
    ['black', 'True black terminal theme', '*black*, *trueblack*'],
    ['transparent', 'Terminal-default transparent background', '*transparent*, *clear*'],
    ['graphite', 'Default neutral dark theme', 'default'],
    ['retrogreen', 'Old-school green terminal on graphite', 'N/A'],
    ['cobalt', 'Blue/gray professional theme', 'N/A'],
    ['green', 'Green/code development theme', '*dev*, *code*'],
    ['green2', 'Green background with blue-style light foregrounds', '*green2*, *brightgreen*'],
    ['blue', 'Visible blue research theme', '*research*, *doc*'],
    ['purple', 'Visible purple writing theme', 'N/A'],
    ['orange', 'Orange warning theme', '*debug*, *test*'],
    ['red', 'Visible red urgent theme', '*prod*, *urgent*'],
    ['nord', 'Nord dark theme', 'N/A'],
    ['everforest', 'Everforest green theme', 'N/A'],
    ['gruvbox', 'Gruvbox retro theme', 'N/A'],
    ['paper', 'Default light neutral theme', 'N/A'],
    ['lcobalt', 'Light cobalt theme', 'N/A'],
    ['lgreen', 'Light green theme', 'N/A'],
    ['lblue', 'Light blue theme', 'N/A'],
    ['lpurple', 'Light purple theme', 'N/A'],
    ['lorange', 'Light orange theme', 'N/A'],
    ['lred', 'Light red theme', 'N/A'],
    ['lnord', 'Light nord theme', 'N/A'],
    ['leverforest', 'Light everforest theme', 'N/A'],
    ['lgruvbox', 'Light gruvbox theme', 'N/A']
  ];

  logger.table(tableHeaders, tableRows);
}

module.exports = { theme, displayThemeList, getAutoTheme };
