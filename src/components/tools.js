'use strict';

const { commandExists, installPackage } = require('../utils/system');

const TOOL_PACKAGES = [
  { binary: 'bat', packageName: 'bat' },
  { binary: 'rg', packageName: 'ripgrep' },
  { binary: 'fd', packageName: 'fd-find' },
  { binary: 'zoxide', packageName: 'zoxide' },
  { binary: 'fzf', packageName: 'fzf' }
];

async function validateTools() {
  const installed = TOOL_PACKAGES.filter((tool) => commandExists(tool.binary)).length;
  return { valid: true, installed: installed >= 3 };
}

async function installTools(_configManager, logger, options = {}) {
  for (const tool of TOOL_PACKAGES) {
    if (commandExists(tool.binary)) continue;

    if (options.dryRun) {
      logger.dryRun(`Would install ${tool.packageName}`);
      continue;
    }

    const result = installPackage(tool.packageName, { yes: options.yes });
    if (!result.success) {
      logger.warning(`Could not install ${tool.packageName}: ${result.stderr || result.stdout}`);
    }
  }

  return { success: true };
}

async function updateTools(configManager, logger, options = {}) {
  return installTools(configManager, logger, options);
}

async function uninstallTools(_configManager, logger) {
  logger.warning('Automatic tools uninstall is not supported.');
  return { success: true, unchanged: true };
}

module.exports = {
  installTools,
  updateTools,
  uninstallTools,
  validateTools
};
