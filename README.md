# Zsh and Starship Configuration

A complete and portable setup for a modern Zsh + Starship + tmux configuration. Neutral style, no Nerd Font required, adaptive to any tmux color theme.

## Features

### Prompt (Starship)
- **Theme**: Neutral/professional — no hardcoded colors, inherits terminal fg automatically
- **Adaptive**: Works with all tmux themes (cobalt, green, blue, purple, orange, red, nord, everforest, gruvbox)
- **No Nerd Font required**: uses plain Unicode symbols (`*` `+` `-` `↑` `↓` `↕`)
- **Git**: branch, status (modified/staged/deleted/ahead/behind), state (rebase/merge/cherry-pick)
- **Python venv**: shown on right prompt when active
- **Format**: `hostname dir branch (status) $`

### Tmux
- **9 color themes**: cobalt (default), green, blue, purple, orange, red, nord, everforest, gruvbox
- **Auto-theme**: session name determines theme automatically (`*dev*` → green, `*prod*` → red, etc.)
- **`ttheme <name>`**: apply theme to current session instantly, all windows updated
- **Plugins via TPM**: tmux-sensible, tmux-yank, tmux-resurrect, tmux-continuum
- **Dual status bar**: current path + time on top, keybind cheatsheet on bottom

### Zsh (Oh My Zsh)
- **Active Plugins**:
  - `git`: Aliases and functions for Git
  - `zsh-autosuggestions`: Suggestions while typing
  - `zsh-syntax-highlighting`: Neutral highlighting (bold/underline, no vivid colors)
  - `zsh-history-substring-search`: Search within history
  - `colored-man-pages`: Colored manual pages
  - `command-not-found`: Suggestions for missing commands

### Modern Tools (Optional)
- **eza**: Modern `ls` with icons (automatically installed)
- **bat**: `cat` clone with syntax highlighting
- **ripgrep**: Extremely fast `grep` alternative
- **fd**: User-friendly `find` alternative
- **zoxide**: Smarter `cd` with memory
- **fzf**: Interactive fuzzy finder

**Smart Aliases:**
- `lt`: Tree view excluding venv, node_modules, and .git
- `lta`: Complete tree view without exclusions
- `lsga`: Tree view with git status **[NEW in v2.1.0]**
- `lsg3`: 3-level tree with git status **[NEW in v2.1.0]**
- `lsgm`: Git status short format (`git status -s`) **[NEW in v2.1.0]**

## Requirements

- Operating System: Fedora, RHEL, Ubuntu, Debian
- Git installed
- Sudo access (for package installation)
- Terminal with 256-color support

## WSL2 Support (Windows)

If using WSL (Windows Subsystem for Linux), the script will automatically detect the environment.

### Automatic Font Installation

The script automatically installs fonts on Windows via PowerShell:

1. Copies fonts to `C:\Users\YourName\Downloads\NerdFonts_Zsh_Setup`
2. Executes PowerShell to install them (no manual installation required)
3. Registers fonts in the Windows Registry
4. Configuration required for Windows Terminal:
   - Settings -> Profiles -> Ubuntu (or your distro) -> Appearance
   - Font face: **MesloLGS NF**
   - Restart Windows Terminal

### Manual Fallback (if PowerShell fails)

If the automatic installation fails:
1. The script will copy the fonts to the **Downloads** folder (`NerdFonts_Zsh_Setup`)
2. Open that folder in Windows
3. Select all `.ttf` files
4. Right-click -> **Install**

## Installation

### via npm (Recommended)

Install directly from GitHub — no clone required:

```bash
npm install -g github:Jaggerxtrm/zsh-starship-config
zsc install
```

Reload the shell when done:

```bash
exec zsh
```

### `zsc` CLI reference

After installing globally, the `zsc` command is available from anywhere:

```bash
zsc install                  # Full setup (first-time)
zsc update                   # Update all components
zsc update eza               # Update a single component
zsc theme nord               # Apply a tmux colour theme
zsc theme cobalt myproject   # Apply theme to a named session
zsc status                   # Show installed versions + health check
zsc help                     # Usage reference
```

**Components** (`zsc update <component>`):
`eza` `tmux` `starship` `fonts` `zshrc` `omz` `plugins` `statusline` `tools`

**Themes** (`zsc theme <name>`):
`cobalt` `green` `blue` `purple` `orange` `red` `nord` `everforest` `gruvbox`

### Update

```bash
zsc update           # update everything
zsc update starship  # update only starship
zsc update eza       # update only eza
```

> **Note:** `npm update -g` does not work for GitHub-installed packages. Use `zsc update` instead, or re-run `npm install -g github:Jaggerxtrm/zsh-starship-config`.

### Manual (Git Clone)

```bash
git clone https://github.com/Jaggerxtrm/zsh-starship-config.git ~/projects/zsh-starship-config
cd ~/projects/zsh-starship-config
./install.sh
```

Update mode (overwrites configs automatically without prompts):

```bash
cd ~/projects/zsh-starship-config && git pull && ./install.sh --update
```

### Available `install.sh` flags

```bash
./install.sh                      # Full installation
./install.sh --update             # Update mode (no prompts, auto-backup)
./install.sh --update --only eza  # Update a single component
./install.sh --status             # Health check only
./install.sh --verbose            # Detailed output
./install.sh --help               # Show all options
```

**Check installed version:**
```bash
cat ~/.zsh-starship-config-version
```

## What Gets Installed

The script automatically installs and configures:

1. **Zsh** + Oh My Zsh
2. **Zsh Plugins** (autosuggestions, syntax-highlighting, history-substring-search)
3. **Starship** prompt (neutral/adaptive theme)
4. **Nerd Fonts** (Meslo, JetBrains, Hack, FiraMono, Cousine)
5. **tmux** + TPM + plugins (tmux-sensible, tmux-yank, tmux-resurrect, tmux-continuum)
6. **tmux themes** (9 themes, auto-applied by session name)
7. **eza** (modern `ls` with icons)
8. **jq** (JSON parser, required for Claude Code status line)
9. **Claude Code status line** (model name, token usage %, git status, venv)
10. **Modern tools** (bat, ripgrep, fd, zoxide — optional)

### Manual Installation

If you prefer to install manually:

#### 1. Install Zsh
```bash
# Fedora
sudo dnf install zsh

# Ubuntu/Debian
sudo apt install zsh
```

#### 2. Install Oh My Zsh
```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

#### 3. Install Zsh Plugins
```bash
# zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# zsh-history-substring-search
git clone https://github.com/zsh-users/zsh-history-substring-search ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-history-substring-search
```

#### 4. Install Starship
```bash
curl -sS https://starship.rs/install.sh | sh
```

#### 5. Install Nerd Fonts

**MesloLGS NF** (Recommended):
```bash
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts
wget https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Regular.ttf
wget https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold.ttf
wget https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Italic.ttf
wget https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold%20Italic.ttf
fc-cache -fv
```

**JetBrainsMono Nerd Font** (Alternative):
```bash
cd /tmp
wget https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.tar.xz
mkdir -p ~/.local/share/fonts/JetBrainsMonoNerdFont
tar -xf JetBrainsMono.tar.xz -C ~/.local/share/fonts/JetBrainsMonoNerdFont
fc-cache -fv
```

**Other Included Nerd Fonts (Hack, FiraMono, Cousine):**
You can install them similarly by downloading `Hack.tar.xz`, `FiraMono.tar.xz`, or `Cousine.tar.xz` from [nerd-fonts releases](https://github.com/ryanoasis/nerd-fonts/releases).

#### 6. Apply Configuration
```bash
# Copy starship config
cp starship.toml ~/.config/starship.toml

# Modify .zshrc to enable Starship
echo 'eval "$(starship init zsh)"' >> ~/.zshrc
```

#### 7. Configure Terminal
In the terminal settings, select the font:
- **MesloLGS NF** (Recommended)
- Or **JetBrainsMono Nerd Font**
- Size: 11 or 12

#### 8. Restart Terminal
```bash
source ~/.zshrc
# Or close and reopen the terminal
```

## Claude Code Status Line Integration

Claude Code can use the **same Starship theme** for its status line, with **advanced features**.

### Automatic Configuration

The `install.sh` script automatically configures the Claude Code status line. The configuration is installed in:
- **Script**: `~/.claude/hooks/statusline-starship.sh`
- **Config**: `~/.claude/settings.json`

### Displayed Information (Enhanced Version)

The Claude Code status line shows **all this information in real-time**:

| Element | Description | Example |
|---|---|---|
| **Model** | Currently used Claude model | `Claude 3.5 Sonnet` |
| **Usage** | Context usage percentage | `[15%]` |
| **User@Host** | Username and hostname | `dawid@fedora` |
| **Directory** | Current path (truncated to repo root) | `second-mind` |
| **Git Branch** | Git branch with icon | ` master` |
| **Git Status** | Uncommitted changes | ` ` (if dirty) |
| **Python Venv** | Active virtual environment | ` (venv)` |

**Full Output Example:**
```
Claude 3.5 Sonnet [15%] dawid@fedora second-mind  master
```

### Advanced Features

#### 1. Real-Time Token Usage
- Shows context usage percentage `[X%]`
- Updates dynamically during the conversation
- **Automatically decreases after context compaction**

#### 2. Model Display
- Shows the currently used Claude model (cyan)
- Useful when switching between models (Sonnet, Opus, Haiku)

#### 3. Git Intelligence
- Directory truncated to repository root (like Starship)
- Automatically detects changes with `core.useBuiltinFSMonitor=false` to avoid locks
- Properly rendered Nerd Font icons

#### 4. Starship-Matched Colors
- **Model/Usage**: Cyan (`\033[36m`) - distinctive
- **Username**: White (`\033[37m`)
- **Hostname**: Bold Green (`\033[1;32m`)
- **Directory**: White (`\033[37m`)
- **Git**: Green (`\033[32m`)
- **Python Venv**: Yellow (`\033[33m`)

### Manual Configuration (If Necessary)

If you wish to install manually or customize:

```bash
# Copy the script from the repository
cp data/claude-statusline-starship.sh ~/.claude/hooks/statusline-starship.sh
chmod +x ~/.claude/hooks/statusline-starship.sh

# Configure Claude Code (preserves other settings)
jq '. + {"statusLine": {"command": "~/.claude/hooks/statusline-starship.sh"}}' \
    ~/.claude/settings.json > ~/.claude/settings.json.tmp && \
    mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

### Requirements
- `jq` for JSON parsing (automatically installed)
- Nerd Font installed (already configured for Starship)
- Git (for repository features)

### Source File

The complete script is available in `data/claude-statusline-starship.sh` in the repository.

## Customization

### Prompt Colors

Colors are defined in `starship.toml`:

```toml
# Username and Directory
style = "white"  # White text

# Git branch
style = "#bb9af7"  # Tokyo Night Purple

# Git status (errors/modifications)
style = "#f7768e"  # Tokyo Night Red

# Python/Languages
style = "#e0af68"  # Tokyo Night Yellow

# Prompt character (Green/Red)
success_symbol = "[>](bold green)"
error_symbol = "[>](bold red)"
```

### Syntax Highlighting (Ocean Blue)

Syntax highlighting colors while typing are configured with the Ocean Blue palette:

```bash
ZSH_HIGHLIGHT_STYLES[command]='fg=#61afef'        # Commands: Light Blue
ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=#e06c75'  # Errors: Soft Red
ZSH_HIGHLIGHT_STYLES[builtin]='fg=#56b6c2'        # Built-in: Cyan
ZSH_HIGHLIGHT_STYLES[alias]='fg=#528bff'          # Alias: Electric Blue
ZSH_HIGHLIGHT_STYLES[path]='fg=#89b4fa'           # Path: Light Blue
```

### Nerd Font Icons

The icons used are Unicode Nerd Font codes:

| Element | Code |
|---|---|
| Linux (Fedora) | `\uf303` |
| Git Branch | `\ue0a0` |
| GitHub | `\uf1d3` |
| Python | `\ue73c` |
| Modified | `\uf040` |
| Staged | `\uf00c` |
| Untracked | `\uf128` |

To modify icons, edit `starship.toml` and change the `\uf...` or `\ue...` codes.

### Adding Other Languages

Example for adding Ruby:

```toml
[ruby]
symbol = " "
format = "[$symbol]($style)[($version )]($style)"
style = "#e06c75"
```

Then add `$ruby` to the `format` string at the top of the file.

## Advanced Configuration

### Disable Username

```toml
[username]
disabled = true  # Change to true
```

### Always Show Python Version

```toml
[python]
format = "[$symbol($version )]($style)[($virtualenv )]($style)"
```

### Change Linux Icon

The configuration uses a generic Tux (\uf17c). You can change it:

```toml
# Generic Tux (default)
format = "\uf17c [$user]($style) "

# Fedora Logo
format = "\uf303 [$user]($style) "

# Ubuntu Logo
format = "\uf31b [$user]($style) "
```

### Add Time

```toml
[time]
disabled = false
format = "[$time]($style) "
style = "#7dcfff"
```

And add `$time` to the main format.

## Git Icons Documentation

| Unicode | Meaning |
|---|---|
| \uf040 | Modified files (not staged) |
| \uf00c | Staged files ready for commit |
| \uf128 | Untracked files |
| \uf05e | Deleted files |
| \uf02b | Renamed files |
| \uf0aa | Commits ahead (need push) |
| \uf0ab | Commits behind (need pull) |
| \uf0ec | Divergent branches or conflicts |
| \uf448 | Stashed changes |

## Troubleshooting

### Icons appear as empty squares

**Issue**: The terminal is not using a Nerd Font.

**Solution**:
1. Verify the font is installed: `fc-list | grep "MesloLGS\|JetBrainsMono Nerd"`
2. In terminal preferences, select "MesloLGS NF" or "JetBrainsMono Nerd Font"
3. COMPLETELY close the terminal and reopen it
4. Test with: `echo "\uf1d3 \ue0a0 \ue73c"`

### Starship does not start

**Issue**: `command not found: starship`

**Solution**:
```bash
# Verify installation
which starship

# If not found, reinstall
curl -sS https://starship.rs/install.sh | sh

# Verify PATH
echo $PATH | grep ".local/bin"

# Add to .zshrc if missing
export PATH="$HOME/.local/bin:$PATH"
```

### Zsh Plugins not working

**Issue**: Autosuggestions or syntax highlighting not active.

**Solution**:
```bash
# Verify plugin installation
ls ~/.oh-my-zsh/custom/plugins/

# Verify .zshrc
grep "plugins=" ~/.zshrc

# Must contain:
plugins=(git zsh-autosuggestions zsh-syntax-highlighting ...)
```

### Python/languages not detected

**Issue**: Python icon does not appear.

**Solution**:
- Ensure you are in a directory with `.py`, `requirements.txt`, or `pyproject.toml` files
- Or activate a virtual environment
- Verify with: `starship module python`

## Resources

- [Starship Documentation](https://starship.rs/config/)
- [Nerd Fonts](https://www.nerdfonts.com/)
- [Oh My Zsh](https://ohmyz.sh/)
- [Nerd Fonts Cheat Sheet](https://www.nerdfonts.com/cheat-sheet) - Search for icons

## Contributing

Have improvements or suggestions? Feel free to modify the configuration!

## License

Free and open-source configuration. Use and modify as you please!

---

**Created for a more productive and pleasant development experience**
