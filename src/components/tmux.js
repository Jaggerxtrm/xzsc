'use strict';

const path = require('path');
const fs = require('fs-extra');
const { commandExists, getCommandPath } = require('../utils/system');
const { ensureBinary, homePath } = require('./helpers');

async function validateTmux(configManager) {
  const configPath = configManager.get('components.tmux.configPath', homePath('.tmux.conf'));
  return { valid: true, installed: commandExists('tmux') && await fs.pathExists(configPath) };
}

async function installTmux(configManager, logger, options = {}) {
  ensureBinary('tmux', 'tmux', logger, options);

  const source = path.join(options.scriptDir, 'data', 'tmux.conf');
  const destination = configManager.get('components.tmux.configPath', homePath('.tmux.conf'));
  const zshPath = getCommandPath('zsh') || '/bin/zsh';

  if (options.dryRun) {
    logger.dryRun(`Would copy ${source} -> ${destination}`);
    return { success: true, dryRun: true };
  }

  const content = await fs.readFile(source, 'utf8');
  const rendered = content.replace(/ZSHELL_PATH/g, zshPath);

  await fs.ensureDir(path.dirname(destination));
  if (await fs.pathExists(destination)) {
    await fs.copy(destination, `${destination}.zsc.bak`, { overwrite: true });
  }
  await fs.writeFile(destination, rendered, 'utf8');

  return { success: true };
}

async function updateTmux(configManager, logger, options = {}) {
  return installTmux(configManager, logger, options);
}

async function uninstallTmux(_configManager, logger) {
  logger.warning('Automatic tmux uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installTmux,
  updateTmux,
  uninstallTmux,
  validateTmux
};
