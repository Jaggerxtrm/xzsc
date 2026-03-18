'use strict';

const path = require('path');
const fs = require('fs-extra');
const { commandExists, execute } = require('../utils/system');
const { copyFileWithBackup, ensureBinary, homePath } = require('./helpers');

async function validateStarship(configManager) {
  const cfg = configManager.get('components.starship.configPath', homePath('.config', 'starship.toml'));
  return { valid: true, installed: commandExists('starship') && await fs.pathExists(cfg) };
}

async function installStarship(configManager, logger, options = {}) {
  if (!commandExists('starship')) {
    try {
      ensureBinary('starship', 'starship', logger, options);
    } catch (_err) {
      if (options.dryRun) {
        // already handled as dry-run
      } else {
        const result = execute('curl -fsSL https://starship.rs/install.sh | sh -s -- -y');
        if (!result.success || !commandExists('starship')) {
          throw new Error('Unable to install starship via package manager or official installer.');
        }
      }
    }
  }

  const source = path.join(options.scriptDir, 'starship.toml');
  const destination = configManager.get('components.starship.configPath', homePath('.config', 'starship.toml'));

  if (options.dryRun) {
    logger.dryRun(`Would copy ${source} -> ${destination}`);
    return { success: true, dryRun: true };
  }

  await copyFileWithBackup(source, destination, logger, { backup: true });
  return { success: true };
}

async function updateStarship(configManager, logger, options = {}) {
  return installStarship(configManager, logger, options);
}

async function uninstallStarship(_configManager, logger) {
  logger.warning('Automatic starship uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installStarship,
  updateStarship,
  uninstallStarship,
  validateStarship
};
