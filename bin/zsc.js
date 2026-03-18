#!/usr/bin/env node

'use strict';

const path = require('path');
const { program } = require('commander');
const figlet = require('figlet');
const chalk = require('chalk');

// Import commands
const { install } = require('../src/commands/install');
const { update } = require('../src/commands/update');
const { status } = require('../src/commands/status');
const { theme } = require('../src/commands/theme');
const { config } = require('../src/commands/config');
const { rollback } = require('../src/commands/rollback');
const { backup } = require('../src/commands/backup');

// Constants
const PACKAGE_JSON = require('../package.json');
const VERSION = PACKAGE_JSON.version;
const SCRIPT_DIR = path.join(__dirname, '..');

// ASCII Art Banner
function showBanner() {
  console.log(
    chalk.cyan(figlet.textSync('ZSC', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    }))
  );
  console.log(chalk.gray(`Zsh Starship Config CLI v${VERSION}\n`));
}

// CLI Program Configuration
program
  .name('zsc')
  .description('Modern Zsh + Starship + Nerd Fonts setup via npm')
  .version(VERSION, '-v, --version', 'output version number')
  .helpOption('-h, --help', 'display help for command');

// Global Options
program
  .option('--dry-run', 'Preview changes without applying them')
  .option('-y, --yes', 'Auto-confirm all prompts (non-interactive mode)')
  .option('--verbose', 'Show detailed output')
  .option('-s, --silent', 'Suppress output')
  .option('-f, --force', 'Override safety checks')
  .option('--timeout <seconds>', 'Set operation timeout', '300')
  .option('--retry <count>', 'Number of retries on failure', '3');

// Commands

// zsc install [components...] [options]
program
  .command('install [components...]')
  .description('Install all components or specific ones')
  .option('-o, --only <component>', 'Install only specific component')
  .option('-x, --exclude <component>', 'Exclude specific component')
  .option('-p, --parallel', 'Run operations in parallel')
  .option('--font-type <type>', 'Specify font type (nerd, standard, all)', 'all')
  .option('--shell <shell>', 'Specify shell (zsh, bash, fish)', 'zsh')
  .option('--theme-location <path>', 'Specify theme location')
  .option('--backup-prefix <prefix>', 'Prefix for backup files', 'backup')
  .action(async (components, options) => {
    showBanner();
    await install(components, options, SCRIPT_DIR);
  });

// zsc update [components...] [options]
program
  .command('update [components...]')
  .description('Update all components or specific ones')
  .option('-o, --only <component>', 'Update only specific component')
  .option('-x, --exclude <component>', 'Exclude specific component')
  .option('-p, --parallel', 'Run operations in parallel')
  .action(async (components, options) => {
    showBanner();
    await update(components, options, SCRIPT_DIR);
  });

// zsc uninstall [components...] [options]
program
  .command('uninstall [components...]')
  .description('Uninstall components')
  .option('-o, --only <component>', 'Uninstall only specific component')
  .option('-x, --exclude <component>', 'Exclude specific component')
  .option('--keep-config', 'Keep configuration files')
  .action(async (components, options) => {
    showBanner();
    console.log(chalk.yellow('Uninstall functionality will be implemented in future release'));
  });

// zsc status [components...] [options]
program
  .command('status [components...]')
  .description('Show installation status and health check')
  .option('-o, --only <component>', 'Check only specific component')
  .option('--json', 'Output in JSON format')
  .option('--export <path>', 'Export status to file')
  .action(async (components, options) => {
    showBanner();
    await status(components, options, SCRIPT_DIR);
  });

// zsc config [key] [value] [options]
program
  .command('config [key] [value]')
  .description('Manage configuration')
  .option('-g, --get', 'Get configuration value')
  .option('-s, --set', 'Set configuration value')
  .option('-d, --delete', 'Delete configuration value')
  .option('-l, --list', 'List all configuration')
  .option('--reset', 'Reset configuration to defaults')
  .action(async (key, value, options) => {
    showBanner();
    await config(key, value, options, SCRIPT_DIR);
  });

// zsc theme <name> [session] [options]
program
  .command('theme [name] [session]')
  .description('Apply a tmux color theme')
  .option('-l, --list', 'List available themes')
  .option('--auto', 'Auto-detect session')
  .option('--preview', 'Preview theme without applying')
  .action(async (themeName, session, options) => {
    if (options.list) {
      showBanner();
      const { displayThemeList } = require('../src/commands/theme');
      displayThemeList(require('../src/utils/logger').createLogger());
      return;
    }
    showBanner();
    await theme(themeName, session, options, SCRIPT_DIR);
  });

// zsc backup [options]
program
  .command('backup')
  .description('Create backup of current configuration')
  .option('-o, --output <path>', 'Output directory for backup')
  .option('--include-data', 'Include data files in backup')
  .option('--compress', 'Compress backup to zip')
  .action(async (options) => {
    showBanner();
    await backup(options, SCRIPT_DIR);
  });

// zsc restore [options]
program
  .command('restore')
  .description('Restore configuration from backup')
  .option('-i, --input <path>', 'Input backup file')
  .option('--dry-run', 'Preview restoration without applying')
  .action(async (options) => {
    showBanner();
    console.log(chalk.yellow('Restore functionality will be implemented in future release'));
  });

// zsc rollback [options]
program
  .command('rollback')
  .description('Rollback last changes')
  .option('-s, --step <n>', 'Rollback specific number of steps', '1')
  .option('--list', 'List available rollback points')
  .option('--dry-run', 'Preview rollback without applying')
  .action(async (options) => {
    showBanner();
    await rollback(options, SCRIPT_DIR);
  });

// zsc help
program
  .command('help')
  .description('Display help information')
  .action(() => {
    showBanner();
    program.help();
  });

// Error handling
program.on('command:*', (operands) => {
  console.error(chalk.red(`error: unknown command '${operands[0]}'`));
  console.log(chalk.gray("Run 'zsc --help' to see available commands"));
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// If no arguments, show help
if (!process.argv.slice(2).length) {
  showBanner();
  program.help();
}
