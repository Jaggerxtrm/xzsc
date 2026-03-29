'use strict';

const path = require('path');
const fs = require('fs-extra');
const { copyFromData, homePath } = require('./helpers');

async function validateTmuxThemes(configManager) {
  const target = configManager.get('components.tmux.themePath', homePath('.tmux', 'themes.sh'));
  return { valid: true, installed: await fs.pathExists(target) };
}

async function installTmuxThemes(configManager, logger, options = {}) {
  const tmuxDir = homePath('.tmux');
  const themePath = configManager.get('components.tmux.themePath', homePath('.tmux', 'themes.sh'));

  if (options.dryRun) {
    logger.dryRun(`Would copy tmux theme assets into ${tmuxDir}`);
    return { success: true, dryRun: true };
  }

  await fs.ensureDir(tmuxDir);
  await copyFromData(options.scriptDir, 'themes.sh', themePath, logger, { executable: true, backup: true });
  await copyFromData(options.scriptDir, 'apply-theme-hook.sh', path.join(tmuxDir, 'apply-theme-hook.sh'), logger, { executable: true, backup: true });

  const scriptsDir = path.join(tmuxDir, 'scripts');
  await fs.ensureDir(scriptsDir);
  const gitPaneStatus = path.join(options.scriptDir, 'data', 'git-pane-status.sh');
  if (await fs.pathExists(gitPaneStatus)) {
    await copyFromData(options.scriptDir, 'git-pane-status.sh', path.join(scriptsDir, 'git-pane-status.sh'), logger, { executable: true, backup: true });
  }

  const themesDoc = path.join(options.scriptDir, 'data', 'THEMES.md');
  if (await fs.pathExists(themesDoc)) {
    await copyFromData(options.scriptDir, 'THEMES.md', path.join(tmuxDir, 'THEMES.md'), logger, { backup: true });
  }

  return { success: true };
}

async function updateTmuxThemes(configManager, logger, options = {}) {
  return installTmuxThemes(configManager, logger, options);
}

async function uninstallTmuxThemes(_configManager, logger) {
  logger.warning('Automatic tmux themes uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installTmuxThemes,
  updateTmuxThemes,
  uninstallTmuxThemes,
  validateTmuxThemes
};
