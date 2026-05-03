# Zsh Starship Config - npm Installer

**Modern Zsh + Starship + Nerd Fonts setup via npm**

A robust and feature-rich CLI installer that provides a complete Zsh, Starship, tmux, and development environment setup with advanced features like rollback, configuration management, and dry-run modes.

## Features

- ✨ **Comprehensive Installation**: Zsh, Oh My Zsh, Starship, tmux, Nerd Fonts, eza, and modern tools
- 🎨 **9 Tmux Themes**: cobalt, green, blue, purple, orange, red, nord, everforest, gruvbox, cream
- 🔄 **Rollback System**: Undo changes if something goes wrong
- 💾 **Backup Management**: Automatic backups before modifications
- 🔧 **Configuration Management**: Persistent configuration with CLI and interactive modes
- 🎯 **Dry-run Mode**: Preview changes without applying them
- 📊 **Status Monitoring**: Real-time system health and component status
- 🎨 **Clipboard Support**: Native OSC 52 clipboard for Linux/Wayland with mouse support

## Installation

### Quick Install

```bash
# Install globally via npm
npm install -g @jaggerxtrm/xzsc

# Run installer
zsc install
```

### Install Specific Components

```bash
# Install only Zsh and Starship
zsc install --only zsh --only starship

# Install tmux themes only
zsc install --only tmuxThemes

# Install with custom options
zsc install --font-type nerd --shell zsh
```

## Usage

### Basic Commands

```bash
# Show help
zsc help

# Show version
zsc --version

# Check installation status
zsc status

# Apply tmux theme
zsc theme nord

# Auto-detect session and apply theme
zsc theme --auto

# List available themes
zsc theme --list

# Manage configuration
zsc config --list
```

### Advanced Usage

#### Dry-run Mode (Preview Changes)

```bash
# Preview installation without applying changes
zsc install --dry-run

# Preview theme application
zsc theme cobalt --preview

# Preview update
zsc update --dry-run
```

#### Component Filtering

```bash
# Install everything except fonts
zsc install --exclude fonts

# Update only specific components
zsc update --only starship --only tmux

# Update multiple specific components
zsc update tmux themes eza
```

#### Configuration Management

```bash
# Interactive configuration
zsc config

# Get configuration value
zsc config --get components.zsh.enabled

# Set configuration value
zsc config --set preferences.autoUpdate false

# List all configuration
zsc config --list

# Reset to defaults
zsc config --reset

# Export configuration
zsc config --export my-config.json
```

#### Backup and Rollback

```bash
# Create backup
zsc backup

# List rollback points
zsc rollback --list

# Rollback last change
zsc rollback

# Rollback multiple steps
zsc rollback --step 2

# Dry-run rollback
zsc rollback --dry-run
```

## Component Reference

### Available Components

| Component | Description | Dependencies |
|-----------|-------------|--------------|
| `zsh` | Zsh shell and configuration | - |
| `ohMyZsh` | Oh My Zsh framework | zsh |
| `plugins` | Zsh plugins (autosuggestions, syntax-highlighting, etc.) | zsh, ohMyZsh |
| `starship` | Starship prompt | - |
| `fonts` | Nerd Fonts installation | - |
| `tmux` | Tmux terminal multiplexer | - |
| `tmuxPlugins` | Tmux plugins via TPM | tmux |
| `tmuxThemes` | Tmux color themes | tmux |
| `eza` | Modern ls replacement | - |
| `tools` | Modern tools (bat, ripgrep, fd, zoxide, fzf) | - |
| `statusline` | Claude Code status line configuration | starship |
| `zshrc` | Zsh configuration file | zsh, ohMyZsh, starship |
| `hooks` | Git hooks and automation | zsh |

### Aliases

You can use aliases instead of component names:

- `all` - All components
- `full` - All components (same as all)
- `minimal` - zsh, starship, fonts, zshrc
- `dev` - All components (same as all)
- `basic` - zsh, ohMyZsh, plugins, starship, fonts, zshrc

## Tmux Themes

### Available Themes

| Theme | Description | Auto-trigger |
|--------|-------------|--------------|
| `cobalt` | Blue/gray professional theme | - |
| `green` | Code/development theme (`#282c33` bg) | *dev*, *code* |
| `blue` | Blue research theme | *research*, *doc* |
| `purple` | Purple calm theme | - |
| `orange` | Orange warning theme | *debug*, *test* |
| `red` | Red urgent theme | *prod*, *urgent* |
| `nord` | Nord dark theme | - |
| `everforest` | Everforest green theme | - |
| `gruvbox` | Gruvbox retro theme | - |
| `cream` | Cream light theme | - |

### Auto-Theming

When you create tmux sessions, the theme is automatically applied based on the session name:

- `dev*`, `code*` → green/code theme (`#282c33`)
- `research*`, `doc*` → blue theme
- `debug*`, `test*` → orange theme
- `prod*`, `urgent*` → red theme

### Tmux Configuration

The installer automatically configures tmux with:

- **Native clipboard** (OSC 52): Works over SSH, no external tools needed
- **Enhanced tmux-yank**: Improved copy/paste with mouse support
- **9 themes**: Pre-configured color themes
- **Dual status bar**: Current path and keybind cheatsheet
- **TPM plugins**: tmux-sensible, tmux-resurrect, tmux-continuum
- **Auto reload**: Configuration automatically reloaded after changes

## Configuration

### Configuration File

Configuration is stored in `~/.zsc/config.json`:

```json
{
  "version": "1.0.0",
  "components": {
    "zsh": {
      "enabled": true,
      "shell": "zsh",
      "configPath": "~/.zshrc",
      "plugins": ["zsh-autosuggestions", "zsh-syntax-highlighting", "zsh-history-substring-search"]
    },
    "starship": {
      "enabled": true,
      "configPath": "~/.config/starship.toml",
      "binaryPath": "~/.local/bin/starship"
    },
    "tmux": {
      "enabled": true,
      "configPath": "~/.tmux.conf",
      "themePath": "~/.tmux/themes.sh",
      "plugins": ["tmux-sensible", "tmux-resurrect", "tmux-continuum"],
      "tpmPath": "~/.tmux/plugins/tpm"
    }
  },
  "preferences": {
    "autoUpdate": true,
    "checkForUpdates": true,
    "createBackups": true,
    "backupPrefix": "backup",
    "keepBackups": 5,
    "parallelInstall": false
  },
  "paths": {
    "cacheDir": "~/.zsc/cache",
    "logsDir": "~/.zsc/logs",
    "backupDir": "~/.zsc/backups"
  }
}
```

### Configuration Options

| Option | Default | Description |
|--------|----------|-------------|
| `autoUpdate` | true | Automatically check for updates |
| `createBackups` | true | Create backups before modifications |
| `keepBackups` | 5 | Number of backups to keep |
| `backupPrefix` | 'backup' | Prefix for backup files |
| `parallelInstall` | false | Run installations in parallel |

## Advanced Features

### Dry-run Mode

Preview changes without applying them:

```bash
# Preview installation
zsc install --dry-run

# Preview theme application
zsc theme nord --preview

# Preview update
zsc update --dry-run
```

Dry-run mode shows:
- What would be installed/updated
- Files that would be created/modified
- Commands that would be executed
- Configuration changes that would be made

### Rollback System

Undo changes if something goes wrong:

```bash
# List available rollback points
zsc rollback --list

# Rollback last change
zsc rollback

# Rollback multiple changes
zsc rollback --step 3

# Dry-run rollback
zsc rollback --dry-run
```

Rollback features:
- Multi-step rollback support
- Automatic backup creation before changes
- Rollback point tracking
- Safe restoration with verification

### Backup Management

Create and manage backups:

```bash
# Create manual backup
zsc backup

# Backup with options
zsc backup --output ~/backups --compress

# Include data files in backup
zsc backup --include-data

# View backup statistics
zsc status
```

## Examples

### Complete Installation

```bash
# Full installation with all defaults
zsc install

# Non-interactive mode (for scripts/Docker)
zsc install --yes

# Verbose installation
zsc install --verbose
```

### Selective Installation

```bash
# Minimal installation
zsc install minimal

# Install development tools only
zsc install tools

# Install tmux setup only
zsc install tmux tmuxPlugins tmuxThemes

# Exclude specific components
zsc install --exclude fonts
```

### Update Workflow

```bash
# Update all installed components
zsc update

# Update specific components
zsc update starship tmux

# Update with backup creation
zsc update --yes

# Update in dry-run mode
zsc update --dry-run
```

### Theme Management

```bash
# Apply specific theme to current session
zsc theme nord

# Apply theme to specific session
zsc theme cobalt myproject

# Auto-detect session
zsc theme --auto

# List all themes
zsc theme --list

# Preview theme without applying
zsc theme everforest --preview
```

### Configuration Management

```bash
# Interactive configuration
zsc config

# Get specific configuration
zsc config --get preferences.autoUpdate

# Set specific configuration
zsc config --set preferences.parallelInstall true

# Delete configuration value
zsc config --delete components.tmux.enabled

# Export configuration
zsc config --export ~/zsc-config-backup.json

# Reset to defaults
zsc config --reset
```

### Status Monitoring

```bash
# Show all status
zsc status

# Show specific component status
zsc status --only tmux

# Export status as JSON
zsc status --json

# Export status to file
zsc status --export ~/zsc-status.json
```

### Error Recovery

```bash
# Check what failed
zsc status

# Rollback last changes
zsc rollback

# Retry installation with different options
zsc install --yes --verbose
```

## Troubleshooting

### Installation Issues

**Issue**: Permission denied errors
```bash
# Solution: Run with appropriate permissions or use sudo
sudo zsc install

# Or check file permissions
ls -la ~/.zshrc ~/.config/
```

**Issue**: Dependencies not found
```bash
# Solution: Check what's missing
zsc status

# Install missing dependencies
zsc install --only <missing-component>
```

**Issue**: Theme not applying
```bash
# Solution: Check tmux is running
echo $TMUX

# Check theme script exists
ls -la ~/.tmux/themes.sh

# Verify tmux configuration
tmux show-options -g | grep theme
```

### Clipboard Issues

**Issue**: Clipboard not working over SSH
```bash
# Solution: OSC 52 clipboard works over SSH, verify:
# 1. Terminal setting: "set -s set-clipboard on"
# 2. Tmux config: "set -g set-clipboard on"
# 3. Check tmux-yank is installed: ls ~/.tmux/plugins/tpm/
```

**Issue**: tmux-yank not installing via TPM
```bash
# Manual install of tmux-yank
cd ~/.tmux/plugins/tpm
git clone https://github.com/tmux-plugins/tmux-yank

# Reload tmux config
tmux source-file ~/.tmux.conf
```

### Rollback Issues

**Issue**: Rollback not working
```bash
# Check available rollback points
zsc rollback --list

# Verify rollback files exist
ls -la ~/.zsc/backups/

# Force rollback to specific point
zsc rollback --step 1 --force
```

## Migration from Shell Script

If you're currently using the shell script installer (`install.sh`), here's how to migrate:

### Before Migration

1. **Backup current configuration**:
```bash
zsc backup --output ~/migration-backup --compress
```

2. **Check current installation**:
```bash
zsc status
```

3. **Uninstall shell-based components** (if desired):
```bash
# Review what's installed
zsc status --json > current-config.json
```

### Migration Process

```bash
# Fresh install with npm installer
zsc install

# This will:
# - Detect existing components
# - Update configuration
# - Preserve your customizations
# - Install missing components
```

### After Migration

1. **Verify installation**:
```bash
zsc status

# Test core functionality
zsh -c 'echo $ZSH_VERSION'
starship --version
tmux -V
```

2. **Test themes**:
```bash
# List available themes
zsc theme --list

# Apply a theme
zsc theme nord

# Test clipboard
# Select text in tmux with mouse, press v to enter copy mode, press y to copy
# Paste with p in normal mode
```

3. **Configuration sync**:
```bash
# Review your configuration
zsc config --list

# Adjust if needed
zsc config --set preferences.autoUpdate false
```

## System Requirements

### Minimum Requirements

- **OS**: Linux or macOS
- **Shell**: Zsh (bash and fish support planned)
- **Node.js**: v14.0.0 or higher
- **Package Manager**: npm, yarn, or pnpm
- **Disk Space**: ~100 MB for installation
- **Permissions**: Ability to install system packages

### Supported Distributions

- **Fedora**: 35+ ✅
- **Ubuntu/Debian**: All LTS versions ✅
- **Arch Linux**: Tested ✅
- **WSL**: Full support with clipboard enhancements ✅

### Optional Dependencies

For enhanced features, the following are optional but recommended:

- `git`: For version control and some features
- `curl`: For downloading resources
- `tmux`: For terminal multiplexing (optional but recommended)

## Development

### Project Structure

```
xzsc/
├── bin/
│   └── zsc.js              # Main CLI entry point
├── src/
│   ├── commands/              # Command handlers
│   │   ├── install.js
│   │   ├── update.js
│   │   ├── status.js
│   │   ├── theme.js
│   │   ├── config.js
│   │   ├── rollback.js
│   │   └── backup.js
│   └── utils/                 # Utility modules
│       ├── logger.js           # Logging with spinners
│       ├── error-handler.js    # Error handling & retry
│       ├── config-manager.js    # Configuration persistence
│       ├── component-manager.js # Component orchestration
│       ├── downloader.js       # File downloads
│       ├── backup.js          # Backup & restore
│       ├── paths.js           # Path management
│       └── system.js          # System detection
├── data/
│   ├── tmux.conf            # Tmux configuration
│   ├── starship.toml         # Starship prompt config
│   ├── themes.sh             # Tmux theme scripts
│   ├── zshrc                # Zsh configuration
│   └── ...                  # Other data files
├── scripts/
│   └── ...                  # Helper scripts
├── tests/
│   ├── setup.js             # Test setup utilities
│   ├── logger.test.js        # Logger unit tests
│   ├── error-handler.test.js # ErrorHandler unit tests
│   ├── manual-test.js        # Manual CLI tests
│   └── test-planning.md    # Test planning
├── package.json
├── jest.config.js
└── README.md
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- logger.test.js
```

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/Jaggerxtrm/xzsc.git
cd xzsc

# Install dependencies
npm install

# Run tests
npm test

# Link for development
npm link
```

### Code Style

- Use consistent formatting
- Follow existing patterns
- Add tests for new features
- Update documentation

### Submitting Changes

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test: `npm test`
3. Commit changes: `git commit -m "feat: your feature"`
4. Push to GitHub: `git push origin feature/your-feature`
5. Create Pull Request

## License

MIT License - Free to use and modify

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## Support

- **GitHub Issues**: https://github.com/Jaggerxtrm/xzsc/issues
- **Documentation**: https://github.com/Jaggerxtrm/xzsc/wiki
- **Discussions**: https://github.com/Jaggerxtrm/xzsc/discussions

## Acknowledgments

- **Starship**: https://starship.rs
- **Oh My Zsh**: https://ohmyz.sh/
- **Tmux**: https://github.com/tmux/tmux-wiki
- **Nerd Fonts**: https://www.nerdfonts.com/
- **Tmux-yank**: https://github.com/tmux-plugins/tmux-yank

---

**Built with ❤️ for the developer community**
