'use strict';

const path = require('path');
const fs = require('fs-extra');
const { createLogger } = require('../utils/logger');
const ConfigManager = require('../utils/config-manager');
const ComponentManager = require('../utils/component-manager');

/**
 * Status command handler
 */

/**
 * Show installation status
 */
async function status(components = [], options = {}, scriptDir) {
  try {
    // Initialize
    const logger = createLogger({
      silent: false,
      verbose: options.verbose || false
    });

    const configManager = new ConfigManager(logger);
    const componentManager = new ComponentManager(configManager, logger);

    await configManager.init();
    await componentManager.scanSystem();

    logger.banner('INSTALLATION STATUS', 'cyan');

    // Get status
    const allStatus = await componentManager.getAllStatus();

    // Filter components if specified
    let statusToDisplay = allStatus;
    if (components.length > 0) {
      statusToDisplay = {};
      for (const componentId of components) {
        if (componentId in allStatus) {
          statusToDisplay[componentId] = allStatus[componentId];
        } else {
          logger.warning(`Unknown component: ${componentId}`);
        }
      }
    }

    // Display status
    if (options.json) {
      console.log(JSON.stringify(statusToDisplay, null, 2));
    } else {
      await displayStatusTable(statusToDisplay, logger);
      await displaySystemInfo(logger);
      await displayConfigInfo(configManager, logger);
    }

    // Export to file if requested
    if (options.export) {
      await exportStatus(statusToDisplay, options.export, logger);
    }

    // Return summary
    const summary = generateSummary(statusToDisplay);
    displaySummary(summary, logger);

  } catch (error) {
    console.error('\nStatus check failed:', error.message);
    process.exit(1);
  }
}

/**
 * Display status as table
 */
async function displayStatusTable(status, logger) {
  const tableHeaders = ['Component', 'Status', 'Description', 'Dependencies'];
  const tableRows = [];

  for (const [componentId, info] of Object.entries(status)) {
    const statusIcon = info.installed ? '✓' : '✗';
    const statusText = info.installed ? 'Installed' : 'Not installed';
    const depsStatus = info.dependencies.allSatisfied ? '✓' : '✗';
    const depsText = info.dependencies.allSatisfied 
      ? 'Satisfied' 
      : `Missing: ${info.dependencies.missing.join(', ')}`;

    tableRows.push([
      statusIcon + ' ' + info.name,
      statusText,
      info.description,
      depsStatus + ' ' + depsText
    ]);
  }

  logger.section('Components');
  logger.table(tableHeaders, tableRows);
}

/**
 * Display system information
 */
async function displaySystemInfo(logger) {
  const { getOS, getCPU, getMemory, getTmuxVersion } = require('../utils/system');

  const osInfo = getOS();
  const cpuInfo = getCPU();
  const memInfo = getMemory();
  const tmuxVersion = getTmuxVersion();

  logger.section('System Information');

  const tableHeaders = ['Property', 'Value'];
  const tableRows = [
    ['OS', osInfo.platform],
    ['Distribution', osInfo.distribution || 'N/A'],
    ['Architecture', osInfo.arch],
    ['WSL', osInfo.isWSL ? 'Yes' : 'No'],
    ['CPU', cpuInfo.model],
    ['Cores', cpuInfo.cores],
    ['Memory', memInfo.used + ' / ' + memInfo.total + ' (' + memInfo.percentage + '%)'],
    ['Tmux', tmuxVersion || 'Not installed']
  ];

  logger.table(tableHeaders, tableRows);
}

/**
 * Display configuration information
 */
async function displayConfigInfo(configManager, logger) {
  const validation = configManager.validate();
  const enabledComponents = configManager.getEnabledComponents();

  logger.section('Configuration');

  const tableHeaders = ['Property', 'Value'];
  const tableRows = [
    ['Configuration Valid', validation.valid ? '✓ Yes' : '✗ No'],
    ['Enabled Components', enabledComponents.length],
    ['Auto Update', configManager.get('preferences.autoUpdate') ? 'Yes' : 'No'],
    ['Create Backups', configManager.get('preferences.createBackups') ? 'Yes' : 'No'],
    ['Keep Backups', configManager.get('preferences.keepBackups')],
    ['Parallel Install', configManager.get('preferences.parallelInstall') ? 'Yes' : 'No']
  ];

  logger.table(tableHeaders, tableRows);

  if (!validation.valid) {
    logger.warning('Configuration errors:');
    validation.errors.forEach(err => logger.warning(`  - ${err}`));
  }
}

/**
 * Export status to file
 */
async function exportStatus(status, exportPath, logger) {
  const fs = require('fs-extra');
  
  try {
    await fs.writeFile(exportPath, JSON.stringify(status, null, 2));
    logger.success(`Status exported to: ${exportPath}`);
  } catch (error) {
    logger.error(`Failed to export status: ${error.message}`);
  }
}

/**
 * Generate summary
 */
function generateSummary(status) {
  const installed = Object.values(status).filter(s => s.installed).length;
  const total = Object.keys(status).length;
  const missingDeps = [];

  for (const [componentId, info] of Object.entries(status)) {
    if (!info.dependencies.allSatisfied) {
      missingDeps.push(...info.dependencies.missing);
    }
  }

  return {
    installed,
    total,
    percentage: Math.round((installed / total) * 100),
    hasIssues: missingDeps.length > 0,
    missingDependencies: [...new Set(missingDeps)]
  };
}

/**
 * Display summary
 */
function displaySummary(summary, logger) {
  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${summary.installed}/${summary.total} components installed (${summary.percentage}%)`);

  if (summary.hasIssues) {
    console.log('\n⚠ Issues detected:');
    console.log(`  Missing dependencies: ${summary.missingDependencies.join(', ')}`);
    console.log('\nRun: zsc install <component> to fix');
  } else {
    console.log('\n✓ All dependencies satisfied');
  }

  console.log('='.repeat(60));
}

module.exports = { status };
