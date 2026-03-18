'use strict';

const path = require('path');
const fs = require('fs-extra');
const { copyFromData, homePath } = require('./helpers');

async function validateStatusline(configManager) {
  const hookPath = configManager.get('components.statusline.hookPath', homePath('.claude', 'hooks', 'statusline-starship.sh'));
  return { valid: true, installed: await fs.pathExists(hookPath) };
}

async function installStatusline(configManager, logger, options = {}) {
  const hookPath = configManager.get('components.statusline.hookPath', homePath('.claude', 'hooks', 'statusline-starship.sh'));
  const settingsPath = configManager.get('components.statusline.configPath', homePath('.claude', 'settings.json'));

  if (options.dryRun) {
    logger.dryRun(`Would install statusline hook at ${hookPath}`);
    return { success: true, dryRun: true };
  }

  await copyFromData(options.scriptDir, 'claude-statusline-starship.sh', hookPath, logger, { executable: true, backup: true });

  await fs.ensureDir(path.dirname(settingsPath));

  let settings = {};
  if (await fs.pathExists(settingsPath)) {
    try {
      settings = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
    } catch (_error) {
      logger.warning(`${settingsPath} is not valid JSON. Skipping statusLine update.`);
      return { success: true, unchanged: true };
    }
  }

  settings.statusLine = {
    type: 'command',
    command: '~/.claude/hooks/statusline-starship.sh'
  };

  await fs.writeJson(settingsPath, settings, { spaces: 2 });

  return { success: true };
}

async function updateStatusline(configManager, logger, options = {}) {
  return installStatusline(configManager, logger, options);
}

async function uninstallStatusline(_configManager, logger) {
  logger.warning('Automatic statusline uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installStatusline,
  updateStatusline,
  uninstallStatusline,
  validateStatusline
};
