'use strict';

const fs = require('fs-extra');
const { run, homePath } = require('./helpers');

function getOhMyZshPath(configManager) {
  return configManager.get('components.zsh.ohMyZshPath', homePath('.oh-my-zsh'));
}

async function validateOhMyZsh(configManager) {
  const dir = getOhMyZshPath(configManager);
  return { valid: true, installed: await fs.pathExists(pathJoinGit(dir)) };
}

function pathJoinGit(dir) {
  return `${dir}/.git`;
}

async function installOhMyZsh(configManager, logger, options = {}) {
  const dir = getOhMyZshPath(configManager);

  if (await fs.pathExists(pathJoinGit(dir))) {
    return { success: true, unchanged: true };
  }

  if (options.dryRun) {
    logger.dryRun(`Would clone oh-my-zsh into ${dir}`);
    return { success: true, dryRun: true };
  }

  run(`git clone --depth=1 https://github.com/ohmyzsh/ohmyzsh.git "${dir}"`, logger);
  return { success: true };
}

async function updateOhMyZsh(configManager, logger, options = {}) {
  const dir = getOhMyZshPath(configManager);
  if (!await fs.pathExists(pathJoinGit(dir))) {
    return installOhMyZsh(configManager, logger, options);
  }

  if (options.dryRun) {
    logger.dryRun(`Would update oh-my-zsh in ${dir}`);
    return { success: true, dryRun: true };
  }

  run(`git -C "${dir}" pull --ff-only`, logger);
  return { success: true };
}

async function uninstallOhMyZsh(configManager, logger) {
  const dir = getOhMyZshPath(configManager);
  if (await fs.pathExists(dir)) {
    logger.warning(`Keeping ${dir}. Remove manually if desired.`);
  }
  return { success: true };
}

module.exports = {
  installOhMyZsh,
  updateOhMyZsh,
  uninstallOhMyZsh,
  validateOhMyZsh
};
