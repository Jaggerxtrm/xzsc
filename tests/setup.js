'use strict';

const fs = require('fs-extra');
const path = require('path');

/**
 * Test setup utilities
 */

const TEST_DIR = path.join(process.cwd(), 'tests', 'temp');
const MOCK_CONFIG_DIR = path.join(TEST_DIR, '.zsc');

/**
 * Setup test environment
 */
async function setupTestEnv() {
  // Clean up any existing test directory
  await fs.remove(TEST_DIR);

  // Create test directory structure
  await fs.ensureDir(TEST_DIR);
  await fs.ensureDir(MOCK_CONFIG_DIR);
  await fs.ensureDir(path.join(MOCK_CONFIG_DIR, 'backups'));
  await fs.ensureDir(path.join(MOCK_CONFIG_DIR, 'cache'));
  await fs.ensureDir(path.join(MOCK_CONFIG_DIR, 'logs'));

  return { testDir: TEST_DIR, mockConfigDir: MOCK_CONFIG_DIR };
}

/**
 * Teardown test environment
 */
async function teardownTestEnv() {
  await fs.remove(TEST_DIR);
}

/**
 * Create mock config file
 */
async function createMockConfig(config) {
  const mockConfig = config || {
    version: '1.0.0',
    components: {
      zsh: { enabled: true },
      starship: { enabled: true },
      tmux: { enabled: true }
    },
    preferences: {
      autoUpdate: true,
      createBackups: true,
      keepBackups: 5
    }
  };

  const configPath = path.join(MOCK_CONFIG_DIR, 'config.json');
  await fs.writeFile(configPath, JSON.stringify(mockConfig, null, 2));

  return configPath;
}

/**
 * Create mock backup file
 */
async function createMockBackup(name, content = 'mock backup content') {
  const backupDir = path.join(MOCK_CONFIG_DIR, 'backups');
  await fs.ensureDir(backupDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `${name}-${timestamp}.json`);

  await fs.writeFile(backupPath, JSON.stringify({ content, timestamp }));
  return backupPath;
}

/**
 * Create mock log file
 */
async function createMockLog(entries = []) {
  const logsDir = path.join(MOCK_CONFIG_DIR, 'logs');
  await fs.ensureDir(logsDir);

  const logPath = path.join(logsDir, 'zsc.log');
  const logContent = entries.map(entry => JSON.stringify(entry)).join('\n');

  await fs.writeFile(logPath, logContent);
  return logPath;
}

/**
 * Mock console output for testing
 */
class MockConsole {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    this.debug = [];
  }

  log(message) {
    this.logs.push({ type: 'log', message, timestamp: Date.now() });
  }

  error(message) {
    this.errors.push({ type: 'error', message, timestamp: Date.now() });
  }

  warn(message) {
    this.warnings.push({ type: 'warn', message, timestamp: Date.now() });
  }

  debug(message) {
    this.debug.push({ type: 'debug', message, timestamp: Date.now() });
  }

  getLogs(type) {
    return this[type] || this.logs;
  }

  clear() {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    this.debug = [];
  }
}

/**
 * Mock filesystem for isolated testing
 */
class MockFileSystem {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.files = {};
  }

  async ensureDir(dirPath) {
    this.files[dirPath] = { type: 'dir', children: {} };
  }

  async readFile(filePath, encoding = 'utf8') {
    return this.files[filePath]?.content || null;
  }

  async writeFile(filePath, content) {
    this.files[filePath] = { type: 'file', content };
  }

  async pathExists(filePath) {
    return filePath in this.files;
  }

  async copy(source, dest) {
    this.files[dest] = { ...this.files[source] };
  }

  async remove(filePath) {
    delete this.files[filePath];
  }

  reset() {
    this.files = {};
  }
}

module.exports = {
  setupTestEnv,
  teardownTestEnv,
  createMockConfig,
  createMockBackup,
  createMockLog,
  MockConsole,
  MockFileSystem,
  TEST_DIR,
  MOCK_CONFIG_DIR
};
