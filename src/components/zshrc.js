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

  const tmuxFunction = `
# Apply tmux theme to current session
ttheme() {
  local session theme bar_style
  session=$(tmux display-message -p '#S' 2>/dev/null)
  if [ -z "$session" ]; then
    echo "No active tmux session"
    return 1
  fi
  if [ -z "$1" ]; then
    echo "Usage: ttheme <theme> [bar-style]"
    echo "Themes: black, transparent, graphite, retrogreen, paper, cobalt, green, green2, blue, purple, orange, red"
    echo "        nord, everforest, gruvbox (dark)"
    echo "        lcobalt, lgreen, lblue, lpurple, lorange, lred, lnord, leverforest, lgruvbox (light)"
    echo "Bar styles: inverse (default), theme, transparent, dark"
    return 1
  fi
  theme="$1"
  if [ -z "$2" ] && [[ "$theme" == "retrogreen" || "$theme" == "phosphor" || "$theme" == "retro-green" || "$theme" == "crt" || "$theme" == "terminal-green" ]]; then
    bar_style="theme"
  else
    bar_style="\${2:-inverse}"
  fi
  "$HOME/.tmux/themes.sh" "$theme" "$session" "$bar_style"
}
`;

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
