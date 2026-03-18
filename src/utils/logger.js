'use strict';

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');

const LOG_DIR = path.join(process.env.HOME, '.zsc', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'zsc.log');

class Logger {
  constructor(options = {}) {
    this.silent = options.silent || false;
    this.verbose = options.verbose || false;
    this.isDryRun = options.dryRun || false;
    this.spinners = new Map();
  }

  async init() {
    await fs.ensureDir(LOG_DIR);
    await fs.ensureFile(LOG_FILE);
  }

  async log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };

    // Write to log file
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(LOG_FILE, logLine);

    // Console output based on silent mode
    if (!this.silent) {
      this._consoleLog(level, message);
    }
  }

  _consoleLog(level, message) {
    const colors = {
      info: chalk.cyan,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      debug: chalk.gray,
      dryRun: chalk.magenta
    };

    const color = colors[level] || chalk.white;
    const prefix = this.isDryRun ? chalk.magenta('[DRY RUN] ') : '';
    const levelTag = `[${level.toUpperCase()}] `.padEnd(10);
    
    console.log(prefix + color(levelTag) + message);
  }

  info(message, data) {
    return this.log('info', message, data);
  }

  success(message, data) {
    return this.log('success', message, data);
  }

  warning(message, data) {
    return this.log('warning', message, data);
  }

  error(message, data) {
    return this.log('error', message, data);
  }

  debug(message, data) {
    if (this.verbose) {
      return this.log('debug', message, data);
    }
  }

  dryRun(message, data) {
    return this.log('dryRun', message, data);
  }

  // Spinner utilities
  startSpinner(id, text, options = {}) {
    if (this.silent || this.isDryRun) return;

    const spinner = ora({
      text,
      ...options
    }).start();

    this.spinners.set(id, spinner);
  }

  updateSpinner(id, text) {
    const spinner = this.spinners.get(id);
    if (spinner) {
      spinner.text = text;
    }
  }

  stopSpinner(id, success = true, finalText = null) {
    const spinner = this.spinners.get(id);
    if (spinner) {
      if (success) {
        spinner.succeed(finalText);
      } else {
        spinner.fail(finalText);
      }
      this.spinners.delete(id);
    }
  }

  stopAllSpinners(success = true) {
    this.spinners.forEach((spinner, id) => {
      this.stopSpinner(id, success);
    });
  }

  // Progress bar
  showProgress(current, total, text = '') {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filled = Math.round((barLength * percentage) / 100);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    if (!this.silent) {
      process.stdout.write(`\r${chalk.cyan('[')}${bar}${chalk.cyan(']')} ${percentage}% ${text}`);
    }

    return percentage;
  }

  clearProgress() {
    if (!this.silent) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    }
  }

  // Table display
  table(headers, rows) {
    if (this.silent) return;

    // Calculate column widths
    const widths = headers.map((h, i) => {
      const maxRowWidth = Math.max(...rows.map(r => String(r[i]).length));
      return Math.max(h.length, maxRowWidth) + 2;
    });

    // Print header
    const headerRow = headers.map((h, i) => 
      chalk.bold(h.padEnd(widths[i]))
    ).join('');
    console.log(headerRow);
    console.log(chalk.gray(widths.map(w => '─'.repeat(w)).join('')));

    // Print rows
    rows.forEach(row => {
      const rowStr = row.map((cell, i) => 
        String(cell).padEnd(widths[i])
      ).join('');
      console.log(rowStr);
    });
  }

  // Banner
  banner(text, color = 'cyan') {
    if (!this.silent) {
      console.log(chalk[color](`\n${'='.repeat(60)}`));
      console.log(chalk[color](text.padStart(20).padEnd(40)));
      console.log(chalk[color]('='.repeat(60)) + '\n');
    }
  }

  // Section headers
  section(title) {
    if (!this.silent) {
      console.log(`\n${chalk.cyan('───')} ${chalk.bold(title)} ${chalk.cyan('───')}`);
    }
  }

  // Step indicators
  step(stepNumber, totalSteps, text) {
    if (!this.silent) {
      const prefix = chalk.cyan(`[${stepNumber}/${totalSteps}]`);
      console.log(`${prefix} ${text}`);
    }
  }
}

// Factory function
const createLogger = (options = {}) => {
  const logger = new Logger(options);
  logger.init();
  return logger;
};

module.exports = { Logger, createLogger };
