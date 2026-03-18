#!/usr/bin/env node

'use strict';

/**
 * Manual testing script for zsc CLI
 * This script runs through common usage scenarios to verify CLI functionality
 */

const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

/**
 * Test runner
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log(`\n${colors.bold}${colors.blue}=== Manual Testing Suite ===${colors.reset}\n`);

    for (const test of this.tests) {
      try {
        console.log(`${colors.bold}Running:${colors.reset} ${test.name}`);
        await test.fn();
        this.passed++;
        console.log(`${colors.green}✓ PASSED${colors.reset}: ${test.name}\n`);
      } catch (error) {
        this.failed++;
        console.log(`${colors.red}✗ FAILED${colors.reset}: ${test.name}`);
        console.log(`  ${colors.red}Error:${colors.reset} ${error.message}\n`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    const total = this.passed + this.failed;
    console.log(`${colors.bold}${colors.blue}=== Test Summary ===${colors.reset}`);
    console.log(`Total: ${total}`);
    console.log(`${colors.green}Passed: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${this.failed}${colors.reset}`);

    if (this.failed === 0) {
      console.log(`\n${colors.green}${colors.bold}All tests passed!${colors.reset}\n`);
    } else {
      console.log(`\n${colors.red}${colors.bold}Some tests failed.${colors.reset}\n`);
      process.exit(1);
    }
  }
}

/**
 * Test helpers
 */
function executeCLI(command) {
  try {
    const result = execSync(`node ${path.join(__dirname, '..', 'bin', 'zsc.js')} ${command}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || '', 
      error: error.stderr || error.message 
    };
  }
}

function assertContains(output, text) {
  if (!output.includes(text)) {
    throw new Error(`Expected output to contain: "${text}"`);
  }
}

function assertNotContains(output, text) {
  if (output.includes(text)) {
    throw new Error(`Expected output NOT to contain: "${text}"`);
  }
}

function assertExitCode(result, expectedCode) {
  if (result.success !== (expectedCode === 0)) {
    throw new Error(`Expected exit code ${expectedCode}, but got different result`);
  }
}

// Create test runner
const runner = new TestRunner();

// Test Cases

runner.test('CLI shows help', async () => {
  const result = executeCLI('help');
  assertExitCode(result, 0);
  assertContains(result.output, 'Commands:');
  assertContains(result.output, 'install');
  assertContains(result.output, 'update');
  assertContains(result.output, 'status');
});

runner.test('CLI shows version', async () => {
  const result = executeCLI('--version');
  assertExitCode(result, 0);
  assertContains(result.output, '4.0.0');
});

runner.test('status command displays system info', async () => {
  const result = executeCLI('status');
  // Status should work even if nothing installed
  assertContains(result.output, 'System Information');
  assertContains(result.output, 'Components');
});

runner.test('status command supports JSON output', async () => {
  const result = executeCLI('status --json');
  // Should output valid JSON
  try {
    JSON.parse(result.output);
  } catch (error) {
    throw new Error('Output is not valid JSON');
  }
});

runner.test('theme command lists available themes', async () => {
  const result = executeCLI('theme --list');
  assertContains(result.output, 'Available Themes');
  assertContains(result.output, 'cobalt');
  assertContains(result.output, 'green');
  assertContains(result.output, 'nord');
});

runner.test('theme command errors with invalid theme', async () => {
  const result = executeCLI('theme invalid-theme');
  assertExitCode(result, 1);
  assertContains(result.error, 'Unknown theme');
});

runner.test('dry-run mode works for install', async () => {
  const result = executeCLI('install --dry-run');
  assertContains(result.output, 'DRY RUN MODE');
  assertContains(result.output, 'No changes will be applied');
});

runner.test('dry-run mode works for update', async () => {
  const result = executeCLI('update --dry-run');
  assertContains(result.output, 'DRY RUN MODE');
});

runner.test('dry-run mode works for theme', async () => {
  const result = executeCLI('theme nord --preview');
  assertContains(result.output, 'PREVIEW MODE');
  assertContains(result.output, 'No changes will be applied');
});

runner.test('config command shows configuration structure', async () => {
  const result = executeCLI('config --list');
  assertContains(result.output, 'version');
  assertContains(result.output, 'components');
  assertContains(result.output, 'preferences');
});

runner.test('install command shows usage on error', async () => {
  const result = executeCLI('install invalid-component');
  // Should show error about unknown component
  assertNotContains(result.output, 'SUCCESS');
});

runner.test('CLI handles unknown commands', async () => {
  const result = executeCLI('invalid-command');
  assertExitCode(result, 1);
  assertContains(result.error, 'unknown command');
});

// Run tests
runner.run().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset} ${error.message}`);
  process.exit(1);
});
