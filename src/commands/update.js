'use strict';

const path = require('path');
const { createLogger } = require('../utils/logger');
const ConfigManager = require('../utils/config-manager');
const ComponentManager = require('../utils/component-manager');

/**
 * Update command handler
 */

/**
 * Update components
 */
async function update(components = [], options = {}, scriptDir) {
  try {
    // Initialize
    const logger = createLogger({
      silent: options.silent || false,
      verbose: options.verbose || false,
      dryRun: options.dryRun || false
    });

    const configManager = new ConfigManager(logger);
    const componentManager = new ComponentManager(configManager, logger);

    await configManager.init();

    // Scan current installation
    await componentManager.scanSystem();

    // Resolve components to update
    const componentsToUpdate = resolveComponents(components, options.only, options.exclude, componentManager);
    
    if (componentsToUpdate.length === 0) {
      logger.warning('No components to update');
      logger.info('Run: zsc status to check installed components');
      return;
    }

    logger.info(`Components to update: ${componentsToUpdate.join(', ')}`);
    logger.section('Update Process');

    // Dry run check
    if (options.dryRun) {
      logger.banner('DRY RUN MODE', 'magenta');
      logger.info('No changes will be applied');
      
      for (const componentId of componentsToUpdate) {
        const component = componentManager.getComponent(componentId);
        logger.dryRun(`Would update: ${component.name}`);
      }
      
      return;
    }

    // Prompt for confirmation
    if (!options.yes && !options.dryRun) {
      const confirm = await promptConfirmation(componentsToUpdate);
      if (!confirm) {
        logger.info('Update cancelled');
        process.exit(0);
      }
    }

    // Update process
    logger.banner('UPDATE PROCESS', 'cyan');

    // Create backup before update
    if (options.createBackup !== false) {
      logger.section('Creating Backup');
      const backupManager = require('../utils/backup');
      const bm = new backupManager(logger);
      await bm.init();
      
      const configPath = path.join(process.env.HOME, '.zsc', 'config.json');
      if (await require('fs-extra').pathExists(configPath)) {
        await bm.backup(configPath, {
          compress: true,
          prefix: 'pre-update'
        });
      }
    }

    // Update components
    const startTime = Date.now();
    let stepNumber = 1;
    const totalSteps = componentsToUpdate.length;

    const results = [];
    const errors = [];

    for (const componentId of componentsToUpdate) {
      logger.step(stepNumber, totalSteps, `Updating ${componentId}...`);

      try {
        const updater = loadComponentUpdater(componentId, scriptDir);
        const result = await updater.update(configManager, logger, options);
        
        if (result.success) {
          logger.success(`✓ ${componentId} updated successfully`);
          results.push({ component: componentId, success: true });
        } else if (result.unchanged) {
          logger.info(`ℹ ${componentId} already up to date`);
          results.push({ component: componentId, success: true, unchanged: true });
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        errors.push({ component: componentId, error: error.message });
        
        if (options.stopOnError) {
          logger.error('Update stopped due to error');
          break;
        }
      }

      stepNumber++;
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Summary
    logger.banner('UPDATE SUMMARY', 'cyan');
    printSummary(results, errors, duration, logger);

    // Final message
    if (errors.length === 0) {
      logger.success('✓ Update completed successfully!');
      logger.info('\nNext steps:');
      logger.info('1. Restart your terminal or run: source ~/.zshrc');
      logger.info('2. Run: zsc status to verify updates');
    } else {
      logger.warning('Update completed with errors');
      logger.info('Run: zsc status to check component status');
    }

  } catch (error) {
    console.error('\nUpdate failed:', error.message);
    process.exit(1);
  }
}

/**
 * Resolve components to update
 */
function resolveComponents(components, only = null, exclude = null, componentManager) {
  const availableComponents = componentManager.getAllComponents().map(c => c.id);
  
  // If no components specified, update all installed
  if (components.length === 0) {
    components = componentManager.getEnabledComponents();
    
    if (components.length === 0) {
      // Fall back to all available if none enabled
      components = availableComponents;
    }
  }

  // Expand aliases
  let expanded = [];
  for (const component of components) {
    if (availableComponents.includes(component)) {
      expanded.push(component);
    } else {
      throw new Error(`Unknown component: ${component}`);
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
 * Load component updater
 */
function loadComponentUpdater(componentId, scriptDir) {
  const { execute } = require('../utils/system');
  const updateScript = path.join(scriptDir, 'update.sh');

  return {
    update: async (configManager, logger, options) => {
      const args = ['--update', `--only=${componentId}`];
      if (options.yes) args.push('--yes');
      
      logger.debug(`Running update script with args: ${args.join(' ')}`);
      
      const result = execute(`bash "${updateScript}" ${args.join(' ')}`);
      
      if (!result.success) {
        throw new Error(result.stderr || 'Update script failed');
      }
      
      return { success: true };
    }
  };
}

/**
 * Prompt for confirmation
 */
async function promptConfirmation(components) {
  const inquirer = require('inquirer');
  
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Update ${components.length} component(s)?`,
      default: true
    }
  ]);

  return answer.confirm;
}

/**
 * Print update summary
 */
function printSummary(results, errors, duration, logger) {
  const tableHeaders = ['Component', 'Status'];
  const tableRows = [];

  // Add successful updates
  for (const result of results) {
    const status = result.unchanged ? 'ℹ Up to date' : '✓ Updated';
    tableRows.push([result.component, status]);
  }

  // Add errors
  for (const error of errors) {
    tableRows.push([error.component, `✗ Error: ${error.error}`]);
  }

  logger.table(tableHeaders, tableRows);
  logger.info(`\nDuration: ${duration}s`);
}

module.exports = { update };
