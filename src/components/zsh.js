'use strict';

const { commandExists } = require('../utils/system');
const { ensureBinary } = require('./helpers');

async function validateZsh() {
  return { valid: true, installed: commandExists('zsh') };
}

async function installZsh(_configManager, logger, options = {}) {
  ensureBinary('zsh', 'zsh', logger, options);
  return { success: true };
}

async function updateZsh(configManager, logger, options = {}) {
  return installZsh(configManager, logger, options);
}

async function uninstallZsh(_configManager, logger) {
  logger.warning('Automatic zsh uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installZsh,
  updateZsh,
  uninstallZsh,
  validateZsh
};
