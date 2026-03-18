'use strict';

const { createLogger } = require('../utils/logger');
const ErrorHandler = require('../utils/error-handler');
const ConfigManager = require('../utils/config-manager');
const ComponentManager = require('../utils/component-manager');

/**
 * Install command handler
 */

const COMPONENTS = [
  'zsh',
  'ohMyZsh', 
  'plugins',
  'starship',
  'fonts',
  'tmux',
  'tmuxPlugins',
  'tmuxThemes',
  'eza',
  'tools',
  'statusline',
  'zshrc',
  'hooks'
];

const ALIASES = {
  'all': COMPONENTS,
  'full': COMPONENTS,
  'minimal': ['zsh', 'starship', 'fonts', 'zshrc'],
  'dev': COMPONENTS,
  'basic': ['zsh', 'ohMyZsh', 'plugins', 'starship', 'fonts', 'zshrc']
};

/**
 * Install components
 */
async function install(components = [], options = {}, scriptDir) {
  try {
    // Initialize
    const logger = createLogger({
      silent: options.silent || false,
      verbose: options.verbose || false,
      dryRun: options.dryRun || false
    });

    const errorHandler = new ErrorHandler(logger);
    const configManager = new ConfigManager(logger);
    const componentManager = new ComponentManager(configManager, logger);

    await configManager.init();

    // Resolve components to install
    const componentsToInstall = resolveComponents(components, options.only, options.exclude);
    
    const installOrder = componentManager.getInstallOrder(componentsToInstall);

    logger.info(`Components to install: ${installOrder.join(', ')}`);
    logger.section('Installation Process');

    await componentManager.scanSystem();

    // Check system compatibility
    const systemInfo = await checkSystemCompatibility(logger);
    if (!systemInfo.compatible) {
      logger.error('System compatibility check failed:');
      systemInfo.errors.forEach(err => logger.error(`  - ${err}`));
      process.exit(1);
    }

    // Dry run check
    if (options.dryRun) {
      logger.banner('DRY RUN MODE', 'magenta');
      logger.info('No changes will be applied');
      
      for (const componentId of installOrder) {
        const component = componentManager.getComponent(componentId);
        logger.dryRun(`Would install: ${component.name}`);
      }
      
      return;
    }

    // Prompt for confirmation if not in yes mode
    if (!options.yes && !options.dryRun) {
      const confirm = await promptConfirmation(installOrder);
      if (!confirm) {
        logger.info('Installation cancelled');
        process.exit(0);
      }
    }

    // Installation process
    logger.banner('INSTALLATION', 'cyan');

    // Create backup before installation
    if (options.createBackup !== false) {
      logger.section('Creating Backup');
      const backupManager = require('../utils/backup');
      const bm = new backupManager(logger);
      await bm.init();
      
      const filesToBackup = [
        configManager.get('components.zsh.configPath'),
        configManager.get('components.starship.configPath'),
        configManager.get('components.tmux.configPath')
      ];
      
      await bm.backupMany(filesToBackup.filter(Boolean), {
        compress: true,
        prefix: 'pre-install'
      });
    }

    // Install components
    const startTime = Date.now();
    let stepNumber = 1;
    const totalSteps = installOrder.length;

    const results = [];
    const errors = [];

    for (const componentId of installOrder) {
      logger.step(stepNumber, totalSteps, `Installing ${componentId}...`);

      try {
        const result = await componentManager.install(componentId, {
          ...options,
          scriptDir
        });

        if (result.success) {
          logger.success(`✓ ${componentId} installed successfully`);
          results.push({ component: componentId, success: true });
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        errorHandler.addWarning(`Failed to install ${componentId}: ${error.message}`);
        errors.push({ component: componentId, error: error.message });
        
        if (options.stopOnError) {
          logger.error('Installation stopped due to error');
          break;
        }
      }

      stepNumber++;
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Summary
    logger.banner('INSTALLATION SUMMARY', 'cyan');
    printSummary(results, errors, duration, logger);

    // Update configuration
    for (const result of results) {
      if (result.success) {
        await configManager.enableComponent(result.component);
      }
    }
    await configManager.save();

    // Final message
    if (errors.length === 0) {
      logger.success('✓ Installation completed successfully!');
      logger.info('\nNext steps:');
      logger.info('1. Restart your terminal or run: source ~/.zshrc');
      logger.info('2. Configure terminal font to: MesloLGS NF or JetBrainsMono Nerd Font');
      logger.info('3. Run: zsc status to verify installation');
      
      // Reload tmux configuration to apply changes
      logger.info('\nApplying tmux configuration...');
      const { reload } = require('./reload');
      await reload({ verbose: options.verbose || false }, scriptDir);
    } else {
      logger.warning('Installation completed with errors');
      logger.info('Run: zsc status to check component status');
    }

  } catch (error) {
    console.error('\nInstallation failed:', error.message);
    process.exit(1);
  }
}

/**
 * Resolve components to install
 */
function resolveComponents(components, only = null, exclude = null) {
  if (components.length === 0) {
    components = ['full']; // Default to full install
  }

  // Expand aliases
  let expanded = [];
  for (const component of components) {
    if (ALIASES[component]) {
      expanded = expanded.concat(ALIASES[component]);
    } else if (COMPONENTS.includes(component)) {
      expanded.push(component);
    } else {
      throw new Error(`Unknown component or alias: ${component}`);
    }
  }

  // Remove duplicates
  expanded = [...new Set(expanded)];

  // Apply only filter
  if (only) {
    const onlyComponents = Array.isArray(only) ? only : [only];
    expanded = expanded.filter(c => onlyComponents.includes(c));
  }

  // Apply exclude filter
  if (exclude) {
    const excludeComponents = Array.isArray(exclude) ? exclude : [exclude];
    expanded = expanded.filter(c => !excludeComponents.includes(c));
  }

  return expanded;
}

/**
 * Check system compatibility
 */
async function checkSystemCompatibility(logger) {
  const { getOS, commandExists } = require('../utils/system');
  
  const osInfo = getOS();
  const errors = [];

  // Check OS support
  if (!osInfo.isLinux && !osInfo.isMacOS) {
    errors.push(`Unsupported OS: ${osInfo.platform} (Linux and macOS only)`);
  }

  // Check required commands
  const requiredCommands = ['bash', 'git', 'curl'];
  for (const cmd of requiredCommands) {
    if (!commandExists(cmd)) {
      errors.push(`Required command not found: ${cmd}`);
    }
  }

  return {
    compatible: errors.length === 0,
    errors
  };
}

/**
 * Prompt for confirmation
 */
async function promptConfirmation(components) {
  const inquirer = require('inquirer');
  const prompt = inquirer.prompt || inquirer.default?.prompt;

  if (!prompt) {
    throw new Error('Interactive prompts are unavailable (inquirer import failed).');
  }

  const answer = await prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Install ${components.length} component(s)?`,
      default: true
    }
  ]);

  return answer.confirm;
}

/**
 * Print installation summary
 */
function printSummary(results, errors, duration, logger) {
  const tableHeaders = ['Component', 'Status'];
  const tableRows = [];

  // Add successful installs
  for (const result of results) {
    tableRows.push([result.component, '✓ Success']);
  }

  // Add errors
  for (const error of errors) {
    tableRows.push([error.component, `✗ Error: ${error.error}`]);
  }

  logger.table(tableHeaders, tableRows);
  logger.info(`\nDuration: ${duration}s`);
}

module.exports = { install };
