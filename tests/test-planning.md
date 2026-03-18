# Test Planning for zsc npm Installer

## Overview
Comprehensive testing strategy for the new npm-based zsh CLI installer to ensure stability and reliability before release.

## Test Categories

### 1. Unit Tests (Individual Modules)
- [ ] Logger functionality
  - [ ] Initialize and log levels
  - [ ] Spinner operations
  - [ ] Progress bars
  - [ ] Table display

- [ ] ErrorHandler functionality
  - [ ] Error categorization
  - [ ] Retry mechanism
  - [ ] Summary generation

- [ ] ConfigManager functionality
  - [ ] Configuration load/save
  - [ ] Get/set/delete operations
  - [ ] Backup/restore operations
  - [ ] Validation

- [ ] ComponentManager functionality
  - [ ] Component resolution
  - [ ] Dependency checking
  - [ ] Install order calculation
  - [ ] Status management

- [ ] BackupManager functionality
  - [ ] File backup
  - [ ] Restore operations
  - [ ] Listing backups
  - [ ] Cleanup operations

### 2. Integration Tests (Command Orchestration)
- [ ] Install command
  - [ ] Full installation
  - [ ] Partial installation
  - [ ] Dry-run mode
  - [ ] Component filtering (only/exclude)
  - [ ] Dependency resolution

- [ ] Update command
  - [ ] Update all components
  - [ ] Update specific component
  - [ ] Update with backup creation
  - [ ] Unchanged component handling

- [ ] Status command
  - [ ] Display all status
  - [ ] Display specific component
  - [ ] JSON export
  - [ ] System info display

- [ ] Theme command
  - [ ] Apply specific theme
  - [ ] Auto-detect session
  - [ ] List available themes
  - [ ] Dry-run mode

- [ ] Config command
  - [ ] Interactive mode
  - [ ] Set/get/delete operations
  - [ ] Reset to defaults
  - [ ] Import/export

- [ ] Backup command
  - [ ] Create manual backup
  - [ ] Default file selection
  - [ ] Compress option
  - [ ] Statistics display

- [ ] Rollback command
  - [ ] List rollback points
  - [ ] Execute rollback
  - [ ] Multi-step rollback
  - [ ] Dry-run mode

### 3. End-to-End Tests (Real Scenarios)
- [ ] Fresh install scenario
  - [ ] Install on clean system
  - [ ] Verify all components work
  - [ ] Check configuration files

- [ ] Update scenario
  - [ ] Update from previous version
  - [ ] Verify backups created
  - [ ] Test rollback

- [ ] Error recovery scenario
  - [ ] Handle missing dependencies
  - [ ] Handle permission errors
  - [ ] Handle network failures
  - [ ] Test retry mechanism

- [ ] Compatibility scenario
  - [ ] Test on different Linux distributions
  - [ ] Test with WSL
  - [ ] Test different shell configurations

### 4. Manual Testing (User Experience)
- [ ] CLI UX testing
  - [ ] Help message clarity
  - [ ] Error message helpfulness
  - [ ] Progress indication
  - [ ] Confirmation prompts

- [ ] Real-world usage
  - [ ] Complete fresh install
  - [ ] Update existing install
  - [ ] Apply tmux themes
  - [ ] Check status
  - [ ] Configure settings

## Testing Tools

### Jest Setup
- Unit tests: Jest with common configuration
- Integration tests: Jest with mock filesystem
- E2E tests: Jest with real filesystem in temp directory

### Test Data
- Mock configuration files
- Test scripts for shell command execution
- Sample theme files
- Test backup files

### Test Environment
- Clean test directory
- Isolated from user configuration
- Temporary paths for all operations
- Cleanup after tests

## Success Criteria

### Critical (Must Pass)
- [ ] All unit tests pass
- [ ] Core commands execute without errors
- [ ] Configuration persistence works
- [ ] Backup/restore functionality works

### Important (Should Pass)
- [ ] Error handling prevents system corruption
- [ ] Dry-run mode doesn't modify system
- [ ] Dependency resolution works correctly
- [ ] Progress indicators work as expected

### Nice to Have
- [ ] All integration tests pass
- [ ] E2E scenarios work end-to-end
- [ ] Performance is acceptable (< 5s for status)
- [ ] Help messages are clear and helpful

## Test Execution Order

1. Setup test infrastructure
2. Write unit tests for utility modules
3. Write integration tests for commands
4. Execute all tests and fix issues
5. Perform manual testing of CLI
6. Document any limitations or known issues
7. Final validation against success criteria
