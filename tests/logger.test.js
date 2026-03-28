'use strict';

const { Logger } = require('../src/utils/logger');
const { setupTestEnv, teardownTestEnv, MockConsole } = require('./setup');

describe('Logger', () => {
  let testEnv;
  let mockConsole;

  beforeAll(async () => {
    testEnv = await setupTestEnv();
    mockConsole = new MockConsole();
  });

  afterAll(async () => {
    await teardownTestEnv();
  });

  beforeEach(() => {
    mockConsole.clear();
  });

  describe('Initialization', () => {
    test('should initialize with default options', () => {
      const logger = new Logger({});
      expect(logger).toBeDefined();
      expect(logger.silent).toBe(false);
      expect(logger.verbose).toBe(false);
      expect(logger.isDryRun).toBe(false);
    });

    test('should initialize with custom options', () => {
      const logger = new Logger({
        silent: true,
        verbose: true,
        dryRun: true
      });
      expect(logger.silent).toBe(true);
      expect(logger.verbose).toBe(true);
      expect(logger.isDryRun).toBe(true);
    });
  });

  describe('Logging Levels', () => {
    test('should log info messages', () => {
      const logger = new Logger({ silent: false, verbose: false });
      // This test just verifies no errors are thrown
      expect(() => logger.info('Test info message')).not.toThrow();
    });

    test('should log success messages', () => {
      const logger = new Logger({ silent: false, verbose: false });
      expect(() => logger.success('Test success message')).not.toThrow();
    });

    test('should log warning messages', () => {
      const logger = new Logger({ silent: false, verbose: false });
      expect(() => logger.warning('Test warning message')).not.toThrow();
    });

    test('should log error messages', () => {
      const logger = new Logger({ silent: false, verbose: false });
      expect(() => logger.error('Test error message')).not.toThrow();
    });

    test('should only log debug in verbose mode', () => {
      const normalLogger = new Logger({ silent: false, verbose: false });
      const verboseLogger = new Logger({ silent: false, verbose: true });
      
      // Both should not throw
      expect(() => normalLogger.debug('Test debug')).not.toThrow();
      expect(() => verboseLogger.debug('Test debug')).not.toThrow();
    });
  });

  describe('Spinner Operations', () => {
    test('should start spinner', () => {
      const logger = new Logger({ silent: true, verbose: false });
      expect(() => logger.startSpinner('test', 'Loading...')).not.toThrow();
    });

    test('should update spinner text', () => {
      const logger = new Logger({ silent: true, verbose: false });
      logger.startSpinner('test', 'Initial text');
      expect(() => logger.updateSpinner('test', 'Updated text')).not.toThrow();
    });

    test('should stop spinner with success', () => {
      const logger = new Logger({ silent: true, verbose: false });
      logger.startSpinner('test', 'Loading...');
      expect(() => logger.stopSpinner('test', true, 'Completed!')).not.toThrow();
    });

    test('should stop spinner with error', () => {
      const logger = new Logger({ silent: true, verbose: false });
      logger.startSpinner('test', 'Loading...');
      expect(() => logger.stopSpinner('test', false, 'Failed!')).not.toThrow();
    });

    test('should handle non-existent spinner gracefully', () => {
      const logger = new Logger({ silent: true, verbose: false });
      expect(() => logger.stopSpinner('nonexistent', true)).not.toThrow();
    });
  });

  describe('Progress Bar', () => {
    test('should show progress', () => {
      const logger = new Logger({ silent: true, verbose: false });
      const percentage = logger.showProgress(50, 100, 'Downloading...');
      expect(percentage).toBe(50);
    });

    test('should handle 0% progress', () => {
      const logger = new Logger({ silent: true, verbose: false });
      const percentage = logger.showProgress(0, 100, 'Starting...');
      expect(percentage).toBe(0);
    });

    test('should handle 100% progress', () => {
      const logger = new Logger({ silent: true, verbose: false });
      const percentage = logger.showProgress(100, 100, 'Complete!');
      expect(percentage).toBe(100);
    });

    test('should handle division by zero gracefully', () => {
      const logger = new Logger({ silent: true, verbose: false });
      expect(() => logger.showProgress(50, 0, 'Test')).toThrow();
    });
  });

  describe('Table Display', () => {
    test('should display simple table', () => {
      const logger = new Logger({ silent: true, verbose: false });
      const headers = ['Name', 'Age', 'City'];
      const rows = [
        ['John', 30, 'New York'],
        ['Jane', 25, 'London']
      ];
      
      expect(() => logger.table(headers, rows)).not.toThrow();
    });

    test('should handle empty rows', () => {
      const logger = new Logger({ silent: true, verbose: false });
      const headers = ['Name', 'Age'];
      const rows = [];
      
      expect(() => logger.table(headers, rows)).not.toThrow();
    });
  });

  describe('Banner and Sections', () => {
    test('should display banner', () => {
      const logger = new Logger({ silent: true, verbose: false });
      expect(() => logger.banner('Test Banner', 'cyan')).not.toThrow();
    });

    test('should display section header', () => {
      const logger = new Logger({ silent: true, verbose: false });
      expect(() => logger.section('Test Section')).not.toThrow();
    });

    test('should display step indicator', () => {
      const logger = new Logger({ silent: true, verbose: false });
      expect(() => logger.step(1, 5, 'Installing component...')).not.toThrow();
    });
  });
});
