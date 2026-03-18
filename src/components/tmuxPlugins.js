'use strict';

const path = require('path');
const fs = require('fs-extra');
const { commandExists, execute } = require('../utils/system');
const { homePath, run } = require('./helpers');

function tpmPath(configManager) {
  return configManager.get('components.tmux.tpmPath', homePath('.tmux', 'plugins', 'tpm'));
}

async function validateTmuxPlugins(configManager) {
  const tpm = tpmPath(configManager);
  return { valid: true, installed: await fs.pathExists(path.join(tpm, 'tpm')) };
}

async function installTmuxPlugins(configManager, logger, options = {}) {
  const tpm = tpmPath(configManager);

  if (!await fs.pathExists(path.join(tpm, '.git'))) {
    if (options.dryRun) {
      logger.dryRun(`Would clone TPM into ${tpm}`);
    } else {
      await fs.ensureDir(path.dirname(tpm));
      run(`git clone --depth=1 https://github.com/tmux-plugins/tpm "${tpm}"`, logger);
    }
  }

  if (options.dryRun) {
    logger.dryRun('Would install tmux plugins via TPM');
    return { success: true, dryRun: true };
  }

  if (commandExists('tmux')) {
    execute(`"${tpm}/bin/install_plugins" >/dev/null 2>&1 || true`);
  }

  return { success: true };
}

async function updateTmuxPlugins(configManager, logger, options = {}) {
  const tpm = tpmPath(configManager);
  if (await fs.pathExists(path.join(tpm, '.git')) && !options.dryRun) {
    run(`git -C "${tpm}" pull --ff-only`, logger);
  }
  return installTmuxPlugins(configManager, logger, options);
}

async function uninstallTmuxPlugins(_configManager, logger) {
  logger.warning('Automatic tmux plugin uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installTmuxPlugins,
  updateTmuxPlugins,
  uninstallTmuxPlugins,
  validateTmuxPlugins
};
