'use strict';

const path = require('path');
const fs = require('fs-extra');
const { execute } = require('../utils/system');
const { homePath } = require('./helpers');

async function validateFonts(configManager) {
  const dir = configManager.get('components.fonts.fontDirectory', homePath('.local', 'share', 'fonts'));
  return { valid: true, installed: await fs.pathExists(dir) };
}

async function installFonts(configManager, logger, options = {}) {
  const dir = configManager.get('components.fonts.fontDirectory', homePath('.local', 'share', 'fonts'));
  if (options.dryRun) {
    logger.dryRun(`Would ensure font directory exists: ${dir}`);
    return { success: true, dryRun: true };
  }

  await fs.ensureDir(dir);

  // Trigger font cache refresh if available.
  const fcCache = execute('command -v fc-cache >/dev/null 2>&1 && fc-cache -f');
  if (!fcCache.success) {
    logger.debug('fc-cache not available; skipping cache refresh');
  }

  logger.info('Font directory prepared. Install Nerd Fonts manually if not already installed.');
  return { success: true };
}

async function updateFonts(configManager, logger, options = {}) {
  return installFonts(configManager, logger, options);
}

async function uninstallFonts(_configManager, logger) {
  logger.warning('Automatic font uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installFonts,
  updateFonts,
  uninstallFonts,
  validateFonts
};
