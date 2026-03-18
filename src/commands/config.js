'use strict';

const { createLogger } = require('../utils/logger');
const ConfigManager = require('../utils/config-manager');

/**
 * Config command handler
 */

/**
 * Manage configuration
 */
async function config(key, value, options = {}, scriptDir) {
  try {
    // Initialize
    const logger = createLogger({
      silent: false,
      verbose: options.verbose || false
    });

    const configManager = new ConfigManager(logger);
    await configManager.init();

    // List all configuration
    if (options.list) {
      await displayConfig(configManager, logger);
      return;
    }

    // Reset to defaults
    if (options.reset) {
      const inquirer = require('inquirer');
      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Reset all configuration to defaults?',
          default: false
        }
      ]);

      if (confirm.confirm) {
        await configManager.reset();
        logger.success('Configuration reset to defaults');
      }
      return;
    }

    // Set configuration value
    if (options.set) {
      if (!key || !value) {
        throw new Error('Both key and value are required for --set');
      }
      await configManager.set(key, value);
      logger.success(`Configuration set: ${key} = ${value}`);
      return;
    }

    // Get configuration value
    if (options.get) {
      if (!key) {
        throw new Error('Key is required for --get');
      }
      const val = configManager.get(key, null);
      if (val === null) {
        logger.warning(`Configuration key not found: ${key}`);
      } else {
        console.log(JSON.stringify(val, null, 2));
      }
      return;
    }

    // Delete configuration value
    if (options.delete) {
      if (!key) {
        throw new Error('Key is required for --delete');
      }
      await configManager.delete(key);
      logger.success(`Configuration deleted: ${key}`);
      return;
    }

    // Interactive mode (no flags provided)
    if (!key) {
      await interactiveConfig(configManager, logger);
      return;
    }

    // Show specific key
    const val = configManager.get(key, null);
    if (val === null) {
      throw new Error(`Configuration key not found: ${key}`);
    }
    console.log(`${key} = ${JSON.stringify(val, null, 2)}`);

  } catch (error) {
    console.error('\nConfiguration command failed:', error.message);
    process.exit(1);
  }
}

/**
 * Display configuration
 */
async function displayConfig(configManager, logger) {
  const config = configManager.list();
  
  logger.section('Current Configuration');
  console.log(JSON.stringify(config, null, 2));
  
  logger.section('Common Configuration Paths');
  const paths = {
    'components.zsh.configPath': configManager.get('components.zsh.configPath'),
    'components.starship.configPath': configManager.get('components.starship.configPath'),
    'components.tmux.configPath': configManager.get('components.tmux.configPath'),
    'components.statusline.hookPath': configManager.get('components.statusline.hookPath')
  };
  
  for (const [key, value] of Object.entries(paths)) {
    console.log(`  ${key}: ${value}`);
  }
}

/**
 * Interactive configuration mode
 */
async function interactiveConfig(configManager, logger) {
  const inquirer = require('inquirer');

  const actions = [
    { name: 'View configuration', value: 'view' },
    { name: 'Set value', value: 'set' },
    { name: 'Get value', value: 'get' },
    { name: 'Delete value', value: 'delete' },
    { name: 'Reset to defaults', value: 'reset' },
    { name: 'Backup configuration', value: 'backup' },
    { name: 'Export configuration', value: 'export' },
    { name: 'Exit', value: 'exit' }
  ];

  while (true) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: actions
      }
    ]);

    switch (answer.action) {
      case 'view':
        await displayConfig(configManager, logger);
        break;

      case 'set':
        const setValue = await inquirer.prompt([
          {
            type: 'input',
            name: 'key',
            message: 'Configuration key (e.g., preferences.autoUpdate):',
            validate: input => input.trim() !== '' || 'Key cannot be empty'
          },
          {
            type: 'input',
            name: 'value',
            message: 'Configuration value:',
            validate: input => input.trim() !== '' || 'Value cannot be empty'
          }
        ]);
        await configManager.set(setValue.key, setValue.value);
        logger.success(`Configuration set: ${setValue.key} = ${setValue.value}`);
        break;

      case 'get':
        const getValue = await inquirer.prompt([
          {
            type: 'input',
            name: 'key',
            message: 'Configuration key:',
            validate: input => input.trim() !== '' || 'Key cannot be empty'
          }
        ]);
        const val = configManager.get(getValue.key, null);
        if (val === null) {
          logger.warning(`Configuration key not found: ${getValue.key}`);
        } else {
          console.log(`${getValue.key} = ${JSON.stringify(val, null, 2)}`);
        }
        break;

      case 'delete':
        const delValue = await inquirer.prompt([
          {
            type: 'input',
            name: 'key',
            message: 'Configuration key to delete:',
            validate: input => input.trim() !== '' || 'Key cannot be empty'
          }
        ]);
        await configManager.delete(delValue.key);
        logger.success(`Configuration deleted: ${delValue.key}`);
        break;

      case 'reset':
        const confirmReset = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Reset all configuration to defaults?',
            default: false
          }
        ]);
        if (confirmReset.confirm) {
          await configManager.reset();
          logger.success('Configuration reset to defaults');
        }
        break;

      case 'backup':
        const backupPath = await configManager.backup();
        logger.success(`Configuration backed up to: ${backupPath}`);
        break;

      case 'export':
        const exportPath = await inquirer.prompt([
          {
            type: 'input',
            name: 'path',
            message: 'Export path:',
            default: 'config-export.json',
            validate: input => input.trim() !== '' || 'Path cannot be empty'
          }
        ]);
        await configManager.export(exportPath.path);
        break;

      case 'exit':
        return;
    }
  }
}

module.exports = { config };
