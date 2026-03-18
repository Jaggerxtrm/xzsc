'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.zsc', 'config');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const BACKUP_CONFIG_DIR = path.join(CONFIG_DIR, 'backups');

// Default configuration
const DEFAULT_CONFIG = {
  version: '1.0.0',
  components: {
    zsh: {
      enabled: true,
      shell: 'zsh',
      configPath: path.join(os.homedir(), '.zshrc'),
      plugins: ['zsh-autosuggestions', 'zsh-syntax-highlighting', 'zsh-history-substring-search'],
      ohMyZshPath: path.join(os.homedir(), '.oh-my-zsh')
    },
    starship: {
      enabled: true,
      configPath: path.join(os.homedir(), '.config', 'starship.toml'),
      binaryPath: path.join(os.homedir(), '.local', 'bin', 'starship')
    },
    tmux: {
      enabled: true,
      configPath: path.join(os.homedir(), '.tmux.conf'),
      themePath: path.join(os.homedir(), '.tmux', 'themes.sh'),
      plugins: ['tmux-sensible', 'tmux-yank', 'tmux-resurrect', 'tmux-continuum'],
      tpmPath: path.join(os.homedir(), '.tmux', 'plugins', 'tpm')
    },
    fonts: {
      enabled: true,
      fontDirectory: path.join(os.homedir(), '.local', 'share', 'fonts'),
      fontTypes: ['nerd', 'standard'],
      selectedFonts: ['MesloLGS NF', 'JetBrainsMono Nerd Font', 'Hack Nerd Font']
    },
    eza: {
      enabled: true,
      binaryPath: path.join(os.homedir(), '.local', 'bin', 'eza')
    },
    tools: {
      enabled: true,
      tools: ['bat', 'ripgrep', 'fd', 'zoxide', 'fzf']
    },
    statusline: {
      enabled: true,
      hookPath: path.join(os.homedir(), '.claude', 'hooks', 'statusline-starship.sh'),
      configPath: path.join(os.homedir(), '.claude', 'settings.json')
    }
  },
  preferences: {
    autoUpdate: true,
    checkForUpdates: true,
    createBackups: true,
    backupPrefix: 'backup',
    keepBackups: 5,
    parallelInstall: false,
    dryRun: false,
    verbose: false
  },
  paths: {
    cacheDir: path.join(os.homedir(), '.zsc', 'cache'),
    logsDir: path.join(os.homedir(), '.zsc', 'logs'),
    tmpDir: path.join(os.homedir(), '.zsc', 'tmp'),
    backupDir: path.join(os.homedir(), '.zsc', 'backups')
  }
};

class ConfigManager {
  constructor(logger) {
    this.logger = logger;
    this.config = null;
    this.initialized = false;
  }

  /**
   * Initialize configuration
   */
  async init() {
    try {
      await fs.ensureDir(CONFIG_DIR);
      await fs.ensureDir(BACKUP_CONFIG_DIR);

      if (await fs.pathExists(CONFIG_FILE)) {
        await this.load();
      } else {
        await this.createDefault();
      }

      this.initialized = true;
      this.logger.debug('Configuration initialized');
    } catch (error) {
      this.logger.error('Failed to initialize configuration:', error);
      throw error;
    }
  }

  /**
   * Load configuration from file
   */
  async load() {
    try {
      const configData = await fs.readFile(CONFIG_FILE, 'utf8');
      this.config = JSON.parse(configData);
      this.config = this._mergeWithDefaults(this.config);
      this.logger.debug('Configuration loaded from file');
    } catch (error) {
      this.logger.warning('Failed to load config, using defaults:', error.message);
      await this.createDefault();
    }
  }

  /**
   * Create default configuration
   */
  async createDefault() {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG)); // Deep clone
    await this.save();
    this.logger.debug('Default configuration created');
  }

  /**
   * Merge loaded config with defaults
   */
  _mergeWithDefaults(loadedConfig) {
    return this._deepMerge(DEFAULT_CONFIG, loadedConfig);
  }

  /**
   * Deep merge objects
   */
  _deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        result[key] = this._deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Save configuration to file
   */
  async save() {
    try {
      await fs.writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2));
      this.logger.debug('Configuration saved');
    } catch (error) {
      this.logger.error('Failed to save configuration:', error);
      throw error;
    }
  }

  /**
   * Get configuration value by path
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Set configuration value by path
   */
  async set(path, value) {
    const keys = path.split('.');
    let target = this.config;

    // Navigate to parent of target
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in target) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }

    // Set the value
    target[keys[keys.length - 1]] = value;
    await this.save();

    this.logger.debug(`Configuration set: ${path} = ${value}`);
  }

  /**
   * Delete configuration value by path
   */
  async delete(path) {
    const keys = path.split('.');
    let target = this.config;

    // Navigate to parent of target
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in target)) {
        return; // Path doesn't exist
      }
      target = target[key];
    }

    const lastKey = keys[keys.length - 1];
    if (lastKey in target) {
      delete target[lastKey];
      await this.save();
      this.logger.debug(`Configuration deleted: ${path}`);
    }
  }

  /**
   * List all configuration
   */
  list() {
    return this.config;
  }

  /**
   * Reset configuration to defaults
   */
  async reset() {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    await this.save();
    this.logger.info('Configuration reset to defaults');
  }

  /**
   * Create backup of current configuration
   */
  async backup() {
    if (!await fs.pathExists(CONFIG_FILE)) {
      throw new Error('No configuration to backup');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_CONFIG_DIR, `config-${timestamp}.json`);

    await fs.copy(CONFIG_FILE, backupFile);
    this.logger.info(`Configuration backed up to ${backupFile}`);

    return backupFile;
  }

  /**
   * Restore configuration from backup
   */
  async restore(backupFile) {
    if (!await fs.pathExists(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    // Create backup of current config before restoring
    await this.backup();

    await fs.copy(backupFile, CONFIG_FILE);
    await this.load();

    this.logger.info(`Configuration restored from ${backupFile}`);
  }

  /**
   * List available backups
   */
  async listBackups() {
    if (!await fs.pathExists(BACKUP_CONFIG_DIR)) {
      return [];
    }

    const files = await fs.readdir(BACKUP_CONFIG_DIR);
    return files
      .filter(f => f.startsWith('config-') && f.endsWith('.json'))
      .sort()
      .reverse();
  }

  /**
   * Enable component
   */
  async enableComponent(component) {
    await this.set(`components.${component}.enabled`, true);
  }

  /**
   * Disable component
   */
  async disableComponent(component) {
    await this.set(`components.${component}.enabled`, false);
  }

  /**
   * Check if component is enabled
   */
  isComponentEnabled(component) {
    return this.get(`components.${component}.enabled`, false);
  }

  /**
   * Get enabled components
   */
  getEnabledComponents() {
    const enabled = [];
    const components = this.config.components;

    for (const [name, config] of Object.entries(components)) {
      if (config.enabled) {
        enabled.push(name);
      }
    }

    return enabled;
  }

  /**
   * Validate configuration
   */
  validate() {
    const errors = [];

    // Validate paths
    for (const [key, value] of Object.entries(this.config.paths)) {
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`Invalid path for ${key}: ${value}`);
      }
    }

    // Validate components
    for (const [key, value] of Object.entries(this.config.components)) {
      if (value.enabled === undefined) {
        errors.push(`Missing enabled flag for component ${key}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Export configuration to file
   */
  async export(filePath) {
    await fs.writeFile(filePath, JSON.stringify(this.config, null, 2));
    this.logger.info(`Configuration exported to ${filePath}`);
  }

  /**
   * Import configuration from file
   */
  async import(filePath) {
    const importedData = await fs.readFile(filePath, 'utf8');
    const importedConfig = JSON.parse(importedData);

    // Create backup before importing
    await this.backup();

    this.config = this._mergeWithDefaults(importedConfig);
    await this.save();

    this.logger.info(`Configuration imported from ${filePath}`);
  }
}

module.exports = ConfigManager;
