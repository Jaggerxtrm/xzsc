'use strict';

const fs = require('fs-extra');
const path = require('path');
const { createLogger } = require('../utils/logger');

/**
 * Rollback command handler
 */

/**
 * Rollback last changes
 */
async function rollback(options = {}, scriptDir) {
  try {
    // Initialize
    const logger = createLogger({
      silent: false,
      verbose: options.verbose || false
    });

    // Load rollback state
    const rollbackState = await loadRollbackState(logger);
    if (!rollbackState || rollbackState.entries.length === 0) {
      logger.info('No rollback points available');
      logger.info('Rollback points are created when you make changes with zsc');
      return;
    }

    // List rollback points if requested
    if (options.list) {
      displayRollbackPoints(rollbackState, logger);
      return;
    }

    // Resolve rollback step
    const step = parseInt(options.step) || 1;
    if (step > rollbackState.entries.length) {
      throw new Error(`Rollback step ${step} exceeds available points (${rollbackState.entries.length})`);
    }

    const rollbackEntry = rollbackState.entries[rollbackState.entries.length - step];
    logger.info(`Rolling back to: ${rollbackEntry.description}`);
    logger.info(`Timestamp: ${rollbackEntry.timestamp}`);

    // Dry run check
    if (options.dryRun) {
      logger.banner('DRY RUN MODE', 'magenta');
      logger.info('Would rollback to:');
      logger.info(`  Description: ${rollbackEntry.description}`);
      logger.info(`  Timestamp: ${rollbackEntry.timestamp}`);
      logger.info(`  Files: ${rollbackEntry.files.length} file(s)`);
      logger.info('(No changes will be applied)');
      return;
    }

    // Confirm rollback
    if (!options.yes) {
      const inquirer = require('inquirer');
      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Proceed with rollback? This will replace current configuration.',
          default: false
        }
      ]);

      if (!confirm.confirm) {
        logger.info('Rollback cancelled');
        return;
      }
    }

    // Execute rollback
    logger.banner('ROLLBACK', 'yellow');

    // Create backup before rollback
    logger.section('Creating safety backup');
    const backupManager = require('../utils/backup');
    const bm = new backupManager(logger);
    await bm.init();
    
    for (const file of rollbackEntry.files) {
      if (await fs.pathExists(file.original)) {
        await bm.backup(file.original, { compress: true });
      }
    }

    // Restore files
    logger.section('Restoring files');
    let successCount = 0;
    let errorCount = 0;

    for (const file of rollbackEntry.files) {
      try {
        // Check if backup exists
        if (!await fs.pathExists(file.backup)) {
          throw new Error(`Backup file not found: ${file.backup}`);
        }

        // Create backup of current state
        if (await fs.pathExists(file.original)) {
          const currentBackup = path.join(
            path.dirname(file.backup),
            `current-${path.basename(file.backup)}`
          );
          await fs.copy(file.original, currentBackup);
        }

        // Restore from backup
        await fs.copy(file.backup, file.original);
        successCount++;
        logger.success(`✓ Restored: ${file.original}`);

      } catch (error) {
        errorCount++;
        logger.error(`✗ Failed to restore ${file.original}: ${error.message}`);
      }
    }

    // Update rollback state
    rollbackState.entries = rollbackState.entries.slice(0, -step);
    await saveRollbackState(rollbackState);

    // Summary
    logger.banner('ROLLBACK SUMMARY', 'yellow');
    console.log(`Restored: ${successCount} file(s)`);
    console.log(`Failed: ${errorCount} file(s)`);

    if (errorCount === 0) {
      logger.success('Rollback completed successfully!');
      logger.info('\nNext steps:');
      logger.info('1. Restart your terminal or run: source ~/.zshrc');
      logger.info('2. Verify configuration with: zsc status');
    } else {
      logger.warning('Rollback completed with errors');
    }

  } catch (error) {
    console.error('\nRollback failed:', error.message);
    process.exit(1);
  }
}

/**
 * Load rollback state
 */
async function loadRollbackState(logger) {
  const statePath = path.join(process.env.HOME, '.zsc', 'rollback.json');
  
  try {
    if (await fs.pathExists(statePath)) {
      const stateData = await fs.readFile(statePath, 'utf8');
      return JSON.parse(stateData);
    }
    return { entries: [] };
  } catch (error) {
    logger.warning('Failed to load rollback state:', error.message);
    return { entries: [] };
  }
}

/**
 * Save rollback state
 */
async function saveRollbackState(state) {
  const statePath = path.join(process.env.HOME, '.zsc', 'rollback.json');
  await fs.writeFile(statePath, JSON.stringify(state, null, 2));
}

/**
 * Display available rollback points
 */
function displayRollbackPoints(state, logger) {
  logger.section('Available Rollback Points');

  if (state.entries.length === 0) {
    console.log('No rollback points available');
    return;
  }

  const tableHeaders = ['Step', 'Description', 'Timestamp', 'Files'];
  const tableRows = [];

  // Show in reverse order (newest first)
  for (let i = state.entries.length - 1; i >= 0; i--) {
    const entry = state.entries[i];
    const step = state.entries.length - i;

    tableRows.push([
      step,
      entry.description,
      entry.timestamp,
      entry.files.length
    ]);
  }

  logger.table(tableHeaders, tableRows);

  console.log('\nUsage:');
  console.log('  zsc rollback           - Rollback 1 step');
  console.log('  zsc rollback --step 2  - Rollback 2 steps');
  console.log('  zsc rollback --dry-run  - Preview rollback');
}

module.exports = { rollback };
