'use strict';

const { commandExists } = require('../utils/system');
const { ensureBinary } = require('./helpers');

async function validateEza() {
  return { valid: true, installed: commandExists('eza') || commandExists('exa') };
}

async function installEza(_configManager, logger, options = {}) {
  if (commandExists('eza') || commandExists('exa')) {
    return { success: true, unchanged: true };
  }

  ensureBinary('eza', 'eza', logger, options);
  return { success: true };
}

async function updateEza(configManager, logger, options = {}) {
  return installEza(configManager, logger, options);
}

async function uninstallEza(_configManager, logger) {
  logger.warning('Automatic eza uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installEza,
  updateEza,
  uninstallEza,
  validateEza
};
