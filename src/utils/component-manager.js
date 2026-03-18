'use strict';

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Component definitions
const COMPONENTS = {
  zsh: {
    name: 'Zsh',
    description: 'Zsh shell and configuration',
    dependencies: [],
    installFn: 'installZsh',
    updateFn: 'updateZsh',
    uninstallFn: 'uninstallZsh',
    validateFn: 'validateZsh'
  },
  ohMyZsh: {
    name: 'Oh My Zsh',
    description: 'Oh My Zsh framework',
    dependencies: ['zsh'],
    installFn: 'installOhMyZsh',
    updateFn: 'updateOhMyZsh',
    uninstallFn: 'uninstallOhMyZsh',
    validateFn: 'validateOhMyZsh'
  },
  plugins: {
    name: 'Zsh Plugins',
    description: 'Zsh plugins (autosuggestions, syntax-highlighting, etc.)',
    dependencies: ['zsh', 'ohMyZsh'],
    installFn: 'installPlugins',
    updateFn: 'updatePlugins',
    uninstallFn: 'uninstallPlugins',
    validateFn: 'validatePlugins'
  },
  starship: {
    name: 'Starship',
    description: 'Starship prompt',
    dependencies: [],
    installFn: 'installStarship',
    updateFn: 'updateStarship',
    uninstallFn: 'uninstallStarship',
    validateFn: 'validateStarship'
  },
  fonts: {
    name: 'Nerd Fonts',
    description: 'Nerd Fonts installation',
    dependencies: [],
    installFn: 'installFonts',
    updateFn: 'updateFonts',
    uninstallFn: 'uninstallFonts',
    validateFn: 'validateFonts'
  },
  tmux: {
    name: 'Tmux',
    description: 'Tmux terminal multiplexer',
    dependencies: [],
    installFn: 'installTmux',
    updateFn: 'updateTmux',
    uninstallFn: 'uninstallTmux',
    validateFn: 'validateTmux'
  },
  tmuxPlugins: {
    name: 'Tmux Plugins',
    description: 'Tmux plugins via TPM',
    dependencies: ['tmux'],
    installFn: 'installTmuxPlugins',
    updateFn: 'updateTmuxPlugins',
    uninstallFn: 'uninstallTmuxPlugins',
    validateFn: 'validateTmuxPlugins'
  },
  tmuxThemes: {
    name: 'Tmux Themes',
    description: 'Tmux color themes',
    dependencies: ['tmux'],
    installFn: 'installTmuxThemes',
    updateFn: 'updateTmuxThemes',
    uninstallFn: 'uninstallTmuxThemes',
    validateFn: 'validateTmuxThemes'
  },
  eza: {
    name: 'eza',
    description: 'Modern ls replacement',
    dependencies: [],
    installFn: 'installEza',
    updateFn: 'updateEza',
    uninstallFn: 'uninstallEza',
    validateFn: 'validateEza'
  },
  tools: {
    name: 'Modern Tools',
    description: 'Modern tools (bat, ripgrep, fd, zoxide, fzf)',
    dependencies: [],
    installFn: 'installTools',
    updateFn: 'updateTools',
    uninstallFn: 'uninstallTools',
    validateFn: 'validateTools'
  },
  statusline: {
    name: 'Claude Code Status Line',
    description: 'Claude Code status line configuration',
    dependencies: ['starship'],
    installFn: 'installStatusline',
    updateFn: 'updateStatusline',
    uninstallFn: 'uninstallStatusline',
    validateFn: 'validateStatusline'
  },
  zshrc: {
    name: '.zshrc',
    description: 'Zsh configuration file',
    dependencies: ['zsh', 'ohMyZsh', 'starship'],
    installFn: 'configureZshrc',
    updateFn: 'updateZshrc',
    uninstallFn: 'uninstallZshrc',
    validateFn: 'validateZshrc'
  },
  hooks: {
    name: 'Git Hooks',
    description: 'Git hooks and automation',
    dependencies: ['zsh'],
    installFn: 'installHooks',
    updateFn: 'updateHooks',
    uninstallFn: 'uninstallHooks',
    validateFn: 'validateHooks'
  }
};

class ComponentManager {
  constructor(configManager, logger) {
    this.configManager = configManager;
    this.logger = logger;
    this.installState = {};
  }

  /**
   * Get all available components
   */
  getAllComponents() {
    return Object.entries(COMPONENTS).map(([id, def]) => ({
      id,
      name: def.name,
      description: def.description,
      dependencies: def.dependencies
    }));
  }

  /**
   * Get component by ID
   */
  getComponent(componentId) {
    return COMPONENTS[componentId];
  }

  /**
   * Check if component exists
   */
  hasComponent(componentId) {
    return componentId in COMPONENTS;
  }

  /**
   * Validate component name
   */
  validateComponentName(componentId) {
    if (!this.hasComponent(componentId)) {
      throw new Error(`Unknown component: ${componentId}`);
    }
  }

  /**
   * Check dependencies for a component
   */
  checkDependencies(componentId) {
    const component = this.getComponent(componentId);
    const missing = [];
    const satisfied = [];

    for (const dep of component.dependencies) {
      if (this.isInstalled(dep)) {
        satisfied.push(dep);
      } else {
        missing.push(dep);
      }
    }

    return {
      satisfied,
      missing,
      allSatisfied: missing.length === 0
    };
  }

  /**
   * Get install order for components (topological sort)
   */
  getInstallOrder(componentIds) {
    const visited = new Set();
    const visiting = new Set();
    const order = [];

    const visit = (componentId) => {
      if (visited.has(componentId)) return;
      if (visiting.has(componentId)) {
        throw new Error(`Circular dependency detected: ${componentId}`);
      }

      visiting.add(componentId);

      const component = this.getComponent(componentId);
      for (const dep of component.dependencies) {
        visit(dep);
      }

      visiting.delete(componentId);
      visited.add(componentId);
      order.push(componentId);
    };

    for (const componentId of componentIds) {
      visit(componentId);
    }

    return order;
  }

  /**
   * Check if component is installed
   */
  isInstalled(componentId) {
    return this.installState[componentId] === true;
  }

  /**
   * Mark component as installed
   */
  markInstalled(componentId) {
    this.installState[componentId] = true;
  }

  /**
   * Mark component as uninstalled
   */
  markUninstalled(componentId) {
    this.installState[componentId] = false;
  }

  /**
   * Validate single component
   */
  async validate(componentId) {
    this.validateComponentName(componentId);
    const component = this.getComponent(componentId);

    // Check dependencies
    const deps = this.checkDependencies(componentId);
    if (!deps.allSatisfied) {
      throw new Error(
        `Missing dependencies for ${component.name}: ${deps.missing.join(', ')}`
      );
    }

    // Call component-specific validation
    const validator = require(`../components/${componentId}`);
    if (validator && validator[component.validateFn]) {
      return await validator[component.validateFn](this.configManager, this.logger);
    }

    return { valid: true };
  }

  /**
   * Validate multiple components
   */
  async validateMany(componentIds) {
    const results = {};
    const errors = [];

    for (const componentId of componentIds) {
      try {
        await this.validate(componentId);
        results[componentId] = { valid: true };
      } catch (error) {
        results[componentId] = { valid: false, error: error.message };
        errors.push({ component: componentId, error: error.message });
      }
    }

    return {
      results,
      errors,
      allValid: errors.length === 0
    };
  }

  /**
   * Install single component
   */
  async install(componentId, options = {}) {
    this.validateComponentName(componentId);
    const component = this.getComponent(componentId);

    // Check dependencies
    const deps = this.checkDependencies(componentId);
    if (!deps.allSatisfied && !options.skipDependencies) {
      throw new Error(
        `Missing dependencies for ${component.name}: ${deps.missing.join(', ')}`
      );
    }

    // Dry run check
    if (options.dryRun) {
      this.logger.dryRun(`Would install: ${component.name}`);
      return { success: true, dryRun: true };
    }

    // Load component installer
    const installer = require(`../components/${componentId}`);
    if (!installer || !installer[component.installFn]) {
      throw new Error(`No install function found for ${componentId}`);
    }

    // Execute installation
    this.logger.info(`Installing ${component.name}...`);
    const result = await installer[component.installFn](this.configManager, this.logger, options);

    if (result.success) {
      this.markInstalled(componentId);
      this.logger.success(`${component.name} installed successfully`);
    } else {
      throw new Error(`Failed to install ${component.name}: ${result.error}`);
    }

    return result;
  }

  /**
   * Install multiple components
   */
  async installMany(componentIds, options = {}) {
    const results = {};
    const errors = [];
    const order = options.parallel ? componentIds : this.getInstallOrder(componentIds);

    for (const componentId of order) {
      try {
        await this.install(componentId, options);
        results[componentId] = { success: true };
      } catch (error) {
        results[componentId] = { success: false, error: error.message };
        errors.push({ component: componentId, error: error.message });

        if (options.stopOnError) {
          break;
        }
      }
    }

    return {
      results,
      errors,
      allSuccessful: errors.length === 0
    };
  }

  /**
   * Update single component
   */
  async update(componentId, options = {}) {
    this.validateComponentName(componentId);
    const component = this.getComponent(componentId);

    // Dry run check
    if (options.dryRun) {
      this.logger.dryRun(`Would update: ${component.name}`);
      return { success: true, dryRun: true };
    }

    // Load component updater
    const updater = require(`../components/${componentId}`);
    if (!updater || !updater[component.updateFn]) {
      throw new Error(`No update function found for ${componentId}`);
    }

    // Execute update
    this.logger.info(`Updating ${component.name}...`);
    const result = await updater[component.updateFn](this.configManager, this.logger, options);

    if (result.success) {
      this.logger.success(`${component.name} updated successfully`);
    } else if (!result.unchanged) {
      throw new Error(`Failed to update ${component.name}: ${result.error}`);
    } else {
      this.logger.info(`${component.name} already up to date`);
    }

    return result;
  }

  /**
   * Update multiple components
   */
  async updateMany(componentIds, options = {}) {
    const results = {};
    const errors = [];
    const order = options.parallel ? componentIds : this.getInstallOrder(componentIds);

    for (const componentId of order) {
      try {
        await this.update(componentId, options);
        results[componentId] = { success: true };
      } catch (error) {
        results[componentId] = { success: false, error: error.message };
        errors.push({ component: componentId, error: error.message });

        if (options.stopOnError) {
          break;
        }
      }
    }

    return {
      results,
      errors,
      allSuccessful: errors.length === 0
    };
  }

  /**
   * Uninstall single component
   */
  async uninstall(componentId, options = {}) {
    this.validateComponentName(componentId);
    const component = this.getComponent(componentId);

    // Check if component is used by others
    const dependents = this.getDependents(componentId);
    if (dependents.length > 0 && !options.force) {
      throw new Error(
        `${component.name} is required by: ${dependents.join(', ')}`
      );
    }

    // Dry run check
    if (options.dryRun) {
      this.logger.dryRun(`Would uninstall: ${component.name}`);
      return { success: true, dryRun: true };
    }

    // Load component uninstaller
    const uninstaller = require(`../components/${componentId}`);
    if (!uninstaller || !uninstaller[component.uninstallFn]) {
      throw new Error(`No uninstall function found for ${componentId}`);
    }

    // Execute uninstallation
    this.logger.info(`Uninstalling ${component.name}...`);
    const result = await uninstaller[component.uninstallFn](this.configManager, this.logger, options);

    if (result.success) {
      this.markUninstalled(componentId);
      this.logger.success(`${component.name} uninstalled successfully`);
    } else {
      throw new Error(`Failed to uninstall ${component.name}: ${result.error}`);
    }

    return result;
  }

  /**
   * Get components that depend on given component
   */
  getDependents(componentId) {
    const dependents = [];

    for (const [id, component] of Object.entries(COMPONENTS)) {
      if (component.dependencies.includes(componentId)) {
        dependents.push(component.name);
      }
    }

    return dependents;
  }

  /**
   * Get component status
   */
  async getStatus(componentId) {
    this.validateComponentName(componentId);
    const component = this.getComponent(componentId);

    const isInstalled = this.isInstalled(componentId);
    const deps = this.checkDependencies(componentId);

    return {
      id: componentId,
      name: component.name,
      description: component.description,
      installed: isInstalled,
      dependencies: deps,
      dependents: this.getDependents(componentId)
    };
  }

  /**
   * Get all components status
   */
  async getAllStatus() {
    const status = {};

    for (const componentId of Object.keys(COMPONENTS)) {
      status[componentId] = await this.getStatus(componentId);
    }

    return status;
  }

  /**
   * Get enabled components from configuration
   */
  getEnabledComponents() {
    if (this.configManager && typeof this.configManager.getEnabledComponents === 'function') {
      return this.configManager.getEnabledComponents();
    }
    return [];
  }

  /**
   * Scan system for installed components
   */
  async scanSystem() {
    const installed = [];

    for (const [componentId, component] of Object.entries(COMPONENTS)) {
      try {
        const validator = require(`../components/${componentId}`);
        if (validator && validator[component.validateFn]) {
          const result = await validator[component.validateFn](this.configManager, this.logger);
          if (result.valid || result.installed) {
            this.markInstalled(componentId);
            installed.push(componentId);
          }
        }
      } catch (error) {
        this.logger.debug(`Could not validate ${componentId}: ${error.message}`);
      }
    }

    return installed;
  }
}

module.exports = ComponentManager;
