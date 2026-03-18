'use strict';

const fs = require('fs-extra');
const path = require('path');
const { run, homePath } = require('./helpers');

const PLUGINS = [
  { name: 'zsh-autosuggestions', repo: 'https://github.com/zsh-users/zsh-autosuggestions.git' },
  { name: 'zsh-syntax-highlighting', repo: 'https://github.com/zsh-users/zsh-syntax-highlighting.git' },
  { name: 'zsh-history-substring-search', repo: 'https://github.com/zsh-users/zsh-history-substring-search.git' }
];

function pluginsDir(configManager) {
  const omz = configManager.get('components.zsh.ohMyZshPath', homePath('.oh-my-zsh'));
  return path.join(omz, 'custom', 'plugins');
}

async function validatePlugins(configManager) {
  const base = pluginsDir(configManager);
  const installed = await Promise.all(PLUGINS.map(async (p) => fs.pathExists(path.join(base, p.name))));
  return { valid: true, installed: installed.every(Boolean) };
}

async function installPlugins(configManager, logger, options = {}) {
  const base = pluginsDir(configManager);
  await fs.ensureDir(base);

  for (const plugin of PLUGINS) {
    const dir = path.join(base, plugin.name);
    if (await fs.pathExists(path.join(dir, '.git'))) continue;

    if (options.dryRun) {
      logger.dryRun(`Would clone plugin ${plugin.name}`);
      continue;
    }

    run(`git clone --depth=1 ${plugin.repo} "${dir}"`, logger);
  }

  return { success: true };
}

async function updatePlugins(configManager, logger, options = {}) {
  const base = pluginsDir(configManager);

  for (const plugin of PLUGINS) {
    const dir = path.join(base, plugin.name);
    if (!await fs.pathExists(path.join(dir, '.git'))) continue;

    if (options.dryRun) {
      logger.dryRun(`Would update plugin ${plugin.name}`);
      continue;
    }

    run(`git -C "${dir}" pull --ff-only`, logger);
  }

  return { success: true };
}

async function uninstallPlugins(_configManager, logger) {
  logger.warning('Automatic plugin uninstall is not implemented.');
  return { success: true, unchanged: true };
}

module.exports = {
  installPlugins,
  updatePlugins,
  uninstallPlugins,
  validatePlugins
};
