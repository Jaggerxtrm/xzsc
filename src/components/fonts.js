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
    logger.dryRun('Would install SF Mono Nerd Font from bundled archive');
    return { success: true, dryRun: true };
  }

  await fs.ensureDir(dir);

  // Install SF Mono Nerd Font from bundled archive
  const sfMonoZip = path.join(options.scriptDir, 'data', 'SF-Mono-Nerd-Font-18.0d1e1.0.zip');
  const sfMonoDir = path.join(dir, 'SFMonoNerdFont');

  // Check if already installed
  const sfMonoInstalled = await fs.pathExists(sfMonoDir);
  const fontsExist = sfMonoInstalled && (await fs.readdir(sfMonoDir)).length > 0;

  if (fontsExist) {
    logger.success('SF Mono Nerd Font already installed');
  } else if (await fs.pathExists(sfMonoZip)) {
    logger.info('Installing SF Mono Nerd Font...');
    
    const tmpDir = path.join('/tmp', 'sfmono-extract');
    await fs.ensureDir(tmpDir);
    await fs.ensureDir(sfMonoDir);

    // Extract zip
    const result = execute(`unzip -o "${sfMonoZip}" -d "${tmpDir}"`, { stdio: 'pipe' });
    if (result.success) {
      // Find and move all .otf files
      const extractedDir = path.join(tmpDir, 'SF-Mono-Nerd-Font-18.0d1e1.0');
      if (await fs.pathExists(extractedDir)) {
        const files = await fs.readdir(extractedDir);
        for (const file of files) {
          if (file.endsWith('.otf')) {
            await fs.copy(path.join(extractedDir, file), path.join(sfMonoDir, file));
          }
        }
        logger.success('SF Mono Nerd Font installed');
      }
      // Cleanup
      await fs.remove(tmpDir);
    } else {
      logger.warning('Failed to extract SF Mono Nerd Font archive');
    }
  } else {
    logger.info('SF Mono Nerd Font archive not found in data/');
  }

  // Trigger font cache refresh if available
  const fcCache = execute('command -v fc-cache >/dev/null 2>&1 && fc-cache -f');
  if (!fcCache.success) {
    logger.debug('fc-cache not available; skipping cache refresh');
  }

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
