'use strict';

const path = require('path');
const fs = require('fs-extra');
const { copyFromData, homePath } = require('./helpers');

async function validateZshrc(configManager) {
  const zshrcPath = configManager.get('components.zsh.configPath', homePath('.zshrc'));
  return { valid: true, installed: await fs.pathExists(zshrcPath) };
}

async function configureZshrc(configManager, logger, options = {}) {
  const zshrcPath = configManager.get('components.zsh.configPath', homePath('.zshrc'));

  if (options.dryRun) {
    logger.dryRun(`Would install zshrc at ${zshrcPath}`);
    return { success: true, dryRun: true };
  }

  await copyFromData(options.scriptDir, 'zshrc', zshrcPath, logger, { backup: true });

  const tmuxFunction = `\n# Apply tmux theme to current session\nttheme() {\n  local theme="\${1:-cobalt}"\n  if [ -z \"$TMUX\" ]; then\n    echo \"ttheme: not inside a tmux session\"\n    return 1\n  fi\n  local session\n  session=$(tmux display-message -p '#S' 2>/dev/null)\n  bash \"$HOME/.tmux/themes.sh\" \"$theme\" \"$session\"\n}\n`;

  const current = await fs.readFile(zshrcPath, 'utf8');
  if (!current.includes('ttheme()')) {
    await fs.appendFile(zshrcPath, tmuxFunction);
  }

  return { success: true };
}

async function updateZshrc(configManager, logger, options = {}) {
  return configureZshrc(configManager, logger, options);
}

async function uninstallZshrc(_configManager, logger) {
  logger.warning('Automatic .zshrc uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  configureZshrc,
  updateZshrc,
  uninstallZshrc,
  validateZshrc
};
