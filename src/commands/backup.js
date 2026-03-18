'use strict';

const path = require('path');
const { createLogger } = require('../utils/logger');
const BackupManager = require('../utils/backup');

/**
 * Backup command handler
 */

/**
 * Create backup
 */
async function backup(options = {}, scriptDir) {
  try {
    // Initialize
    const logger = createLogger({
      silent: false,
      verbose: options.verbose || false
    });

    const backupManager = new BackupManager(logger);
    await backupManager.init();

    // Create backup of specified files or default configuration
    let filesToBackup = [];

    if (options.files) {
      filesToBackup = Array.isArray(options.files) ? options.files : [options.files];
    } else {
      // Default files to backup
      filesToBackup = [
        path.join(process.env.HOME, '.zshrc'),
        path.join(process.env.HOME, '.config', 'starship.toml'),
        path.join(process.env.HOME, '.tmux.conf'),
        path.join(process.env.HOME, '.zsc', 'config.json')
      ].filter(p => require('fs-extra').pathExists(p));
    }

    if (filesToBackup.length === 0) {
      logger.info('No files to backup');
      logger.info('Configuration files not found. Run: zsc install first.');
      return;
    }

    logger.info(`Backing up ${filesToBackup.length} file(s)`);
    logger.section('Backup Process');

    // Determine output directory
    const outputDir = options.output || path.join(process.env.HOME, '.zsc', 'backups');

    // Create backup
    const startTime = Date.now();
    const results = [];

    for (const filePath of filesToBackup) {
      const fileName = path.basename(filePath);
      logger.info(`Backing up: ${fileName}`);

      try {
        const result = await backupManager.backup(filePath, {
          compress: options.compress,
          prefix: 'manual-backup',
          component: 'manual'
        });

        results.push({
          file: filePath,
          success: true,
          backupPath: result.path
        });

        logger.success(`✓ Backed up: ${fileName}`);
      } catch (error) {
        results.push({
          file: filePath,
          success: false,
          error: error.message
        });

        logger.error(`✗ Failed to backup ${fileName}: ${error.message}`);
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Summary
    logger.banner('BACKUP SUMMARY', 'cyan');

    const tableHeaders = ['File', 'Status', 'Backup Path'];
    const tableRows = [];

    for (const result of results) {
      const fileName = path.basename(result.file);
      const status = result.success ? '✓ Success' : `✗ Error: ${result.error}`;
      const backupPath = result.success ? result.backupPath : 'N/A';

      tableRows.push([fileName, status, backupPath]);
    }

    logger.table(tableHeaders, tableRows);
    console.log(`Duration: ${duration}s`);

    // Statistics
    const stats = await backupManager.getStatistics();
    logger.section('Backup Statistics');
    console.log(`Total backups: ${stats.totalBackups}`);
    console.log(`Total size: ${stats.totalSizeFormatted}`);
    console.log(`Oldest: ${stats.oldest ? new Date(stats.oldest).toLocaleString() : 'N/A'}`);
    console.log(`Newest: ${stats.newest ? new Date(stats.newest).toLocaleString() : 'N/A'}`);

    if (Object.keys(stats.byComponent).length > 0) {
      console.log('\nBy component:');
      for (const [component, count] of Object.entries(stats.byComponent)) {
        console.log(`  ${component}: ${count} backup(s)`);
      }
    }

    // Final message
    const successfulCount = results.filter(r => r.success).length;
    if (successfulCount === results.length) {
      logger.success('Backup completed successfully!');
    } else {
      logger.warning(`Backup completed with ${results.length - successfulCount} error(s)`);
    }

  } catch (error) {
    console.error('\nBackup failed:', error.message);
    process.exit(1);
  }
}

module.exports = { backup };
