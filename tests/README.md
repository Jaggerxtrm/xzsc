# Testing Guide for zsc CLI Installer

This guide covers the testing approach for the zsh npm-based CLI installer.

## Test Structure

```
tests/
├── setup.js              # Test utilities and mock helpers
├── logger.test.js         # Logger unit tests
├── error-handler.test.js  # ErrorHandler unit tests
├── manual-test.js         # Manual CLI testing script
├── test-planning.md      # Comprehensive test plan
└── README.md             # This file
```

## Running Tests

### Unit Tests with Jest

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run specific test file:
```bash
npm test -- logger.test.js
```

Run tests with coverage:
```bash
npm test -- --coverage
```

### Manual CLI Testing

Run the manual testing suite:
```bash
node tests/manual-test.js
```

This will test common CLI usage scenarios:
- Help and version commands
- Status display
- Theme listing
- Dry-run modes
- Configuration management
- Error handling

## Test Categories

### 1. Unit Tests
Individual module testing with isolated dependencies:

- **Logger** (`tests/logger.test.js`)
  - Log levels and formatting
  - Spinner operations
  - Progress bars
  - Table display

- **ErrorHandler** (`tests/error-handler.test.js`)
  - Error categorization
  - Retry mechanism
  - Summary generation
  - Static error helpers

### 2. Integration Tests
Command orchestration testing (to be added):
- Install command workflows
- Update command workflows
- Status command workflows
- Theme application workflows
- Configuration management workflows

### 3. Manual Tests
Real-world usage scenarios:
```bash
# Test basic help
node bin/zsc.js help

# Test version display
node bin/zsc.js --version

# Test status check
node bin/zsc.js status

# Test theme listing
node bin/zsc.js theme --list

# Test dry-run install
node bin/zsc.js install --dry-run

# Test configuration
node bin/zsc.js config --list
```

### 4. End-to-End Tests
Complete usage scenarios (to be added):
- Fresh installation on clean system
- Update from previous version
- Error recovery scenarios
- Rollback functionality

## Test Environment

### Safe Testing
The testing framework is designed to be safe:
- Uses isolated test directories (`tests/temp/`)
- Mock filesystem for destructive operations
- Does not modify user's actual configuration
- Cleans up after tests complete

### Real-World Testing
For comprehensive testing, create a test environment:
```bash
# Create test user
sudo useradd -m -s /bin/bash testuser

# Switch to test user
su - testuser

# Run tests as test user
npm test

# Cleanup when done
exit  # Exit testuser shell
sudo userdel -r testuser
```

## Coverage Goals

Target coverage thresholds (defined in `jest.config.js`):
- **Statements**: 70% minimum
- **Branches**: 70% minimum  
- **Functions**: 70% minimum
- **Lines**: 70% minimum

## Continuous Testing

### Before Each Commit
1. Run affected unit tests
2. Run manual test suite
3. Verify no regressions

### Before Release
1. Run full test suite
2. Achieve coverage targets
3. Test on multiple systems (Fedora, Ubuntu, WSL)
4. Manual smoke testing of key workflows

## Test Planning Progress

See `tests/test-planning.md` for comprehensive test checklist covering:
- Unit tests (individual modules)
- Integration tests (command orchestration)
- End-to-end tests (real scenarios)
- Manual testing (user experience)

## Debugging Failed Tests

### Run in Debug Mode
```bash
NODE_ENV=debug npm test
```

### Run Specific Test with Verbose Output
```bash
npm test -- logger.test.js --verbose
```

### Check Test Output
- Jest provides detailed failure output
- Check error messages for root cause
- Use Jest's watch mode for iterative debugging

## Known Issues

Document any known test issues or limitations here:
- *Issue 1*: Description and workaround
- *Issue 2*: Description and workaround

## Contributing Tests

When adding new functionality:
1. Write unit tests for new modules
2. Add integration tests for new commands
3. Update test planning document
4. Verify coverage targets maintained
5. Add manual tests for user-facing features

## Test Results

### Unit Tests
- Logger: ✅ Passing
- ErrorHandler: ✅ Passing
- ConfigManager: ⏳ To be added
- ComponentManager: ⏳ To be added
- BackupManager: ⏳ To be added

### Manual Tests
- Help/Version: ✅ Passing
- Status Display: ⏳ Needs testing
- Theme Commands: ⏳ Needs testing
- Config Commands: ⏳ Needs testing
- Error Handling: ⏳ Needs testing
