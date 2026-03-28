'use strict';

const ErrorHandler = require('../src/utils/error-handler');
const { setupTestEnv, teardownTestEnv } = require('./setup');

describe('ErrorHandler', () => {
  let testEnv;
  let handler;

  beforeAll(async () => {
    testEnv = await setupTestEnv();
  });

  afterAll(async () => {
    await teardownTestEnv();
  });

  beforeEach(() => {
    handler = new ErrorHandler({
      info: () => {},
      success: () => {},
      warning: () => {},
      error: () => {},
      debug: () => {},
      silent: false
    });
    handler.clear();
  });

  describe('Error Categorization', () => {
    test('should categorize EACCES error', () => {
      const error = new Error('Permission denied');
      error.code = 'EACCES';
      
      expect(() => handler.handleError(error)).toThrow();
      expect(handler.errors[0]?.type).toBe('PERMISSION');
    });

    test('should categorize ENOENT error', () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      
      expect(() => handler.handleError(error)).toThrow();
      expect(handler.errors[0]?.type).toBe('NOT_FOUND');
    });

    test('should categorize EEXIST error', () => {
      const error = new Error('File exists');
      error.code = 'EEXIST';
      
      expect(() => handler.handleError(error)).toThrow();
      expect(handler.errors[0]?.type).toBe('EXISTS');
    });

    test('should categorize ETIMEDOUT error', () => {
      const error = new Error('Operation timed out');
      error.code = 'ETIMEDOUT';
      
      expect(() => handler.handleError(error)).toThrow();
      expect(handler.errors[0]?.type).toBe('TIMEOUT');
    });

    test('should categorize ECONNREFUSED error', () => {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      
      expect(() => handler.handleError(error)).toThrow();
      expect(handler.errors[0]?.type).toBe('NETWORK');
    });

    test('should categorize ValidationError', () => {
      const error = ErrorHandler.validation('Invalid input');
      
      expect(() => handler.handleError(error)).toThrow();
      expect(handler.errors[0]?.type).toBe('VALIDATION');
    });

    test('should categorize ConfigurationError', () => {
      const error = ErrorHandler.configuration('Config missing');
      
      expect(() => handler.handleError(error)).toThrow();
      expect(handler.errors[0]?.type).toBe('CONFIGURATION');
    });
  });

  describe('Error and Warning Tracking', () => {
    test('should track errors', () => {
      const error = new Error('Test error');
      
      expect(() => handler.catch(error)).not.toThrow();
      expect(handler.errors.length).toBe(1);
      expect(handler.errors[0]?.message).toBe('Test error');
    });

    test('should track warnings', () => {
      expect(() => handler.addWarning('Test warning')).not.toThrow();
      expect(handler.warnings.length).toBe(1);
      expect(handler.warnings[0]?.message).toBe('Test warning');
    });

    test('should track multiple errors and warnings', () => {
      handler.catch(new Error('Error 1'));
      handler.addWarning('Warning 1');
      handler.catch(new Error('Error 2'));
      handler.addWarning('Warning 2');

      expect(handler.errors.length).toBe(2);
      expect(handler.warnings.length).toBe(2);
    });
  });

  describe('Summary Generation', () => {
    test('should generate summary with no issues', () => {
      const summary = handler.getSummary();
      
      expect(summary.errors).toBe(0);
      expect(summary.warnings).toBe(0);
      expect(summary.hasErrors).toBe(false);
      expect(summary.hasWarnings).toBe(false);
      expect(summary.canProceed).toBe(true);
    });

    test('should generate summary with errors', () => {
      handler.catch(new Error('Test error'));
      const summary = handler.getSummary();
      
      expect(summary.errors).toBe(1);
      expect(summary.hasErrors).toBe(true);
      expect(summary.canProceed).toBe(false);
    });

    test('should generate summary with warnings', () => {
      handler.addWarning('Test warning');
      const summary = handler.getSummary();
      
      expect(summary.warnings).toBe(1);
      expect(summary.hasWarnings).toBe(true);
      expect(summary.canProceed).toBe(true); // Only errors prevent proceeding
    });
  });

  describe('Error State Management', () => {
    test('should clear error state', () => {
      handler.catch(new Error('Error 1'));
      handler.addWarning('Warning 1');
      expect(handler.errors.length).toBe(1);
      expect(handler.warnings.length).toBe(1);

      handler.clear();
      
      expect(handler.errors.length).toBe(0);
      expect(handler.warnings.length).toBe(0);
    });
  });

  describe('Retry Mechanism', () => {
    test('should retry on failure', async () => {
      let attempts = 0;
      
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'Success';
      };

      const result = await handler.retry(fn, {
        maxRetries: 3,
        retryDelay: 10
      });

      expect(result).toBe('Success');
      expect(attempts).toBe(3);
    });

    test('should fail after max retries', async () => {
      let attempts = 0;
      
      const fn = async () => {
        attempts++;
        throw new Error('Permanent failure');
      };

      await expect(
        handler.retry(fn, {
          maxRetries: 2,
          retryDelay: 10
        })
      ).rejects.toThrow('Permanent failure');
      expect(attempts).toBe(2);
    });

    test('should call onError callback during retry', async () => {
      let callbackCalls = 0;
      
      const fn = async () => {
        throw new Error('Temporary failure');
      };

      const onError = async (error, attempt) => {
        callbackCalls++;
      };

      await expect(
        handler.retry(fn, {
          maxRetries: 3,
          retryDelay: 10,
          onError
        })
      ).rejects.toThrow();

      expect(callbackCalls).toBe(3);
    });
  });

  describe('Static Error Helpers', () => {
    test('should create ValidationError', () => {
      const error = ErrorHandler.validation('Invalid input');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
    });

    test('should create ConfigurationError', () => {
      const error = ErrorHandler.configuration('Config missing');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.message).toBe('Config missing');
    });

    test('should create RollbackError', () => {
      const error = ErrorHandler.rollback('Rollback failed');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('RollbackError');
      expect(error.code).toBe('ROLLBACK_ERROR');
      expect(error.message).toBe('Rollback failed');
    });
  });
});
