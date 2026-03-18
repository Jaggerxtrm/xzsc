'use strict';

const fs = require('fs-extra');
const { homePath } = require('./helpers');

async function validateHooks() {
  const hooksDir = homePath('.claude', 'hooks');
  return { valid: true, installed: await fs.pathExists(hooksDir) };
}

async function installHooks(_configManager, logger, options = {}) {
  const hooksDir = homePath('.claude', 'hooks');
  if (options.dryRun) {
    logger.dryRun(`Would ensure hooks directory exists: ${hooksDir}`);
    return { success: true, dryRun: true };
  }
  await fs.ensureDir(hooksDir);
  logger.info(`Hooks directory ready: ${hooksDir}`);
  return { success: true };
}

async function updateHooks(configManager, logger, options = {}) {
  return installHooks(configManager, logger, options);
}

async function uninstallHooks(_configManager, logger) {
  logger.warning('Automatic hooks uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installHooks,
  updateHooks,
  uninstallHooks,
  validateHooks
};
