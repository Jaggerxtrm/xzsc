'use strict';

const { createLogger } = require('../utils/logger');
const ConfigManager = require('../utils/config-manager');
const ComponentManager = require('../utils/component-manager');
const { VALID_COMPONENTS } = require('./install');

async function uninstall(components = [], options = {}, scriptDir) {
  try {
    const logger = createLogger({
      silent: options.silent || false,
      verbose: options.verbose || false,
      dryRun: options.dryRun || false
    });

    const configManager = new ConfigManager(logger);
    const componentManager = new ComponentManager(configManager, logger);

    await configManager.init();
    await componentManager.scanSystem();

    const componentsToUninstall = resolveComponents(components, options.only, options.exclude);

    if (componentsToUninstall.length === 0) {
      logger.warning('No components to uninstall');
      return;
    }

    logger.info(`Components to uninstall: ${componentsToUninstall.join(', ')}`);
    logger.section('Uninstall Process');

    if (options.dryRun) {
      logger.banner('DRY RUN MODE', 'magenta');
      for (const componentId of componentsToUninstall) {
        const component = componentManager.getComponent(componentId);
        logger.dryRun(`Would uninstall: ${component.name}`);
        const dependents = componentManager.getDependents(componentId);
        if (dependents.length > 0) {
          logger.dryRun(`  Warning: required by ${dependents.join(', ')}`);
        }
      }
      return;
    }

    if (!options.yes) {
      const inquirer = require('inquirer');
      const prompt = inquirer.prompt || inquirer.default?.prompt;
      if (!prompt) throw new Error('Interactive prompts are unavailable (inquirer import failed).');
      const answer = await prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `Uninstall ${componentsToUninstall.length} component(s)? This may remove configuration files.`,
        default: false
      }]);
      if (!answer.confirm) {
        logger.info('Uninstall cancelled');
        process.exit(0);
      }
    }

    logger.banner('UNINSTALL', 'yellow');

    const results = [];
    const errors = [];

    for (const componentId of componentsToUninstall) {
      try {
        const result = await componentManager.uninstall(componentId, {
          ...options,
          scriptDir
        });
        if (result.success) {
          logger.success(`✓ ${componentId} uninstalled`);
          results.push({ component: componentId, success: true });
          await configManager.disableComponent(componentId);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        errors.push({ component: componentId, error: error.message });
        logger.error(`✗ ${componentId}: ${error.message}`);
      }
    }

    await configManager.save();

    logger.banner('UNINSTALL SUMMARY', 'yellow');
    const tableHeaders = ['Component', 'Status'];
    const tableRows = [
      ...results.map(r => [r.component, '✓ Uninstalled']),
      ...errors.map(e => [e.component, `✗ ${e.error}`])
    ];
    logger.table(tableHeaders, tableRows);

    if (errors.length === 0) {
      logger.success('Uninstall completed successfully!');
      logger.info('\nNext steps:');
      logger.info('1. Restart your terminal or run: source ~/.zshrc');
      logger.info('2. Run: zsc status to verify');
    } else {
      logger.warning('Uninstall completed with errors');
      logger.info('Use --force to override dependency checks');
    }

  } catch (error) {
    console.error('\nUninstall failed:', error.message);
    process.exit(1);
  }
}

function resolveComponents(components, only = null, exclude = null) {
  let expanded = components.length > 0 ? [...components] : [...VALID_COMPONENTS];

  for (const c of expanded) {
    if (!VALID_COMPONENTS.includes(c)) {
      throw new Error(`Unknown component: "${c}"\nValid components: ${VALID_COMPONENTS.join(', ')}`);
    }
  }

  expanded = [...new Set(expanded)];

  if (only) {
    const filter = Array.isArray(only) ? only : [only];
    expanded = expanded.filter(c => filter.includes(c));
  }

  if (exclude) {
    const filter = Array.isArray(exclude) ? exclude : [exclude];
    expanded = expanded.filter(c => !filter.includes(c));
  }

  return expanded;
}

module.exports = { uninstall };
