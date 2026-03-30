#!/bin/bash
# Automatic installation script for Zsh + Starship + Nerd Fonts
# Compatible with Fedora/RHEL and Debian/Ubuntu

set -e

# Prevent sourcing the script (which would exit the terminal session)
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    echo "Error: This script should not be sourced. Run it as: ./install.sh"
    return 1 2>/dev/null || exit 1
fi

# Global variables
UPDATE_MODE=false
VERBOSE=false
YES_MODE=false      # set by --yes / -y: auto-confirm all prompts
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ONLY_COMPONENT=""   # set by --only <component>
STATUS_MODE=false   # set by --status

# Update tracking variables
STARSHIP_UPDATED=false
STARSHIP_SKIPPED=false
STARSHIP_UNCHANGED=false
ZSHRC_UPDATED=false
ZSHRC_SKIPPED=false
ZSHRC_UNCHANGED=false

# Help function
show_help() {
    cat << EOF
Usage: ./install.sh [OPTIONS]

Automatic installation of Zsh + Starship + Nerd Fonts

OPTIONS:
    -u, --update        Update mode: update already installed components
    -y, --yes           Non-interactive: auto-confirm all prompts (CI/Docker)
    -v, --verbose       Verbose output
    -h, --help          Show this message

EXAMPLES:
    ./install.sh                # Normal installation
    ./install.sh --update       # Update all components
    ./install.sh -u -y          # Update non-interactively (no prompts)
    ./install.sh -y             # Fresh install, auto-confirm everything

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--update)
            UPDATE_MODE=true
            shift
            ;;
        -y|--yes)
            YES_MODE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        --only)
            ONLY_COMPONENT="$2"
            shift 2
            ;;
        --status)
            STATUS_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

echo "==================================="
if [ "$UPDATE_MODE" = true ]; then
    echo "Update Zsh + Starship Setup"
else
    echo "Zsh + Starship Setup Installation"
fi
echo "==================================="

# Detect the distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Unable to detect distribution"
    exit 1
fi

# Function to install base packages
install_base_packages() {
    echo -e "\n📦 Installing base packages..."

    if [ "$OS" = "fedora" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
        sudo dnf install -y zsh git curl wget unzip tar
        sudo dnf install -y util-linux-user  # For chsh
    elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt update
        sudo apt install -y zsh git curl wget unzip tar fontconfig
    else
        echo "⚠️  Unsupported distribution: $OS"
        echo "Install manually: zsh git curl wget unzip tar"
        exit 1
    fi
}

# Install Oh My Zsh
install_oh_my_zsh() {
    echo -e "\n🎨 Installing Oh My Zsh..."

    if [ -d "$HOME/.oh-my-zsh" ]; then
        echo "✓ Oh My Zsh already installed"
    else
        RUNZSH=no CHSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
    fi
}

# Install Zsh plugins
install_zsh_plugins() {
    echo -e "\n🔌 Installing Zsh plugins..."

    ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"

    # zsh-autosuggestions
    if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
        git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
    else
        echo "✓ zsh-autosuggestions already installed"
    fi

    # zsh-syntax-highlighting
    if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
        git clone https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
    else
        echo "✓ zsh-syntax-highlighting already installed"
    fi

    # zsh-history-substring-search
    if [ ! -d "$ZSH_CUSTOM/plugins/zsh-history-substring-search" ]; then
        git clone https://github.com/zsh-users/zsh-history-substring-search "$ZSH_CUSTOM/plugins/zsh-history-substring-search"
    else
        echo "✓ zsh-history-substring-search already installed"
    fi
}

# Install Starship
install_starship() {
    echo -e "\n⭐ Installing Starship..."

    if command -v starship &> /dev/null; then
        CURRENT_VERSION=$(starship --version | grep -oP 'starship \K[\d.]+' || echo "unknown")
        echo "✓ Starship already installed (v$CURRENT_VERSION)"

        if [ "$UPDATE_MODE" = true ]; then
            echo "🔄 Updating Starship..."
            curl -sS https://starship.rs/install.sh | sh -s -- -y --force
            NEW_VERSION=$(starship --version | grep -oP 'starship \K[\d.]+' || echo "unknown")
            if [ "$NEW_VERSION" != "$CURRENT_VERSION" ]; then
                echo "✓ Starship updated: v$CURRENT_VERSION → v$NEW_VERSION"
            else
                echo "✓ Starship already at latest version"
            fi
        else
            read -p "Do you want to update Starship? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[YySs]$ ]]; then
                curl -sS https://starship.rs/install.sh | sh -s -- -y --force
                NEW_VERSION=$(starship --version | grep -oP 'starship \K[\d.]+' || echo "unknown")
                echo "✓ Starship updated to v$NEW_VERSION"
            fi
        fi
    else
        echo "Installing Starship..."
        curl -sS https://starship.rs/install.sh | sh -s -- -y
        echo "✓ Starship installed"
    fi
}

# Install Nerd Fonts
install_nerd_fonts() {
    echo -e "\n🔤 Installing Nerd Fonts..."

    local CURRENT_DIR=$(pwd)
    FONT_DIR="$HOME/.local/share/fonts"
    mkdir -p "$FONT_DIR"

    # MesloLGS NF (recommended for Powerlevel10k)
    if fc-list | grep -qi "MesloLGS NF"; then
        echo "✓ MesloLGS NF already installed"
    else
        echo "Downloading MesloLGS NF..."
        cd /tmp
        wget -q https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Regular.ttf
        wget -q https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold.ttf
        wget -q https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Italic.ttf
        wget -q https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold%20Italic.ttf
        mv MesloLGS*.ttf "$FONT_DIR/"
        echo "✓ MesloLGS NF installed"
    fi

    # JetBrainsMono Nerd Font
    if fc-list | grep -qi "JetBrainsMono Nerd Font"; then
        echo "✓ JetBrainsMono Nerd Font already installed"
    else
        echo "Downloading JetBrainsMono Nerd Font..."
        cd /tmp
        wget -q https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.tar.xz
        mkdir -p "$FONT_DIR/JetBrainsMonoNerdFont"
        tar -xf JetBrainsMono.tar.xz -C "$FONT_DIR/JetBrainsMonoNerdFont"
        rm JetBrainsMono.tar.xz
        echo "✓ JetBrainsMono Nerd Font installed"
    fi

    # Hack Nerd Font
    if fc-list | grep -qi "Hack Nerd Font"; then
        echo "✓ Hack Nerd Font already installed"
    else
        echo "Downloading Hack Nerd Font..."
        cd /tmp
        wget -q https://github.com/ryanoasis/nerd-fonts/releases/latest/download/Hack.tar.xz
        mkdir -p "$FONT_DIR/HackNerdFont"
        tar -xf Hack.tar.xz -C "$FONT_DIR/HackNerdFont"
        rm Hack.tar.xz
        echo "✓ Hack Nerd Font installed"
    fi

    # FiraMono Nerd Font
    if fc-list | grep -qi "FiraMono Nerd Font"; then
        echo "✓ FiraMono Nerd Font already installed"
    else
        echo "Downloading FiraMono Nerd Font..."
        cd /tmp
        wget -q https://github.com/ryanoasis/nerd-fonts/releases/latest/download/FiraMono.tar.xz
        mkdir -p "$FONT_DIR/FiraMonoNerdFont"
        tar -xf FiraMono.tar.xz -C "$FONT_DIR/FiraMonoNerdFont"
        rm FiraMono.tar.xz
        echo "✓ FiraMono Nerd Font installed"
    fi

    # Cousine Nerd Font
    if fc-list | grep -qi "Cousine Nerd Font"; then
        echo "✓ Cousine Nerd Font already installed"
    else
        echo "Downloading Cousine Nerd Font..."
        cd /tmp
        wget -q https://github.com/ryanoasis/nerd-fonts/releases/latest/download/Cousine.tar.xz
        mkdir -p "$FONT_DIR/CousineNerdFont"
        tar -xf Cousine.tar.xz -C "$FONT_DIR/CousineNerdFont"
        rm Cousine.tar.xz
        echo "✓ Cousine Nerd Font installed"
    fi

    # SF Mono Nerd Font (bundled, not in official nerd-fonts due to Apple licensing)
    if fc-list | grep -qi "SFMono Nerd Font"; then
        echo "✓ SF Mono Nerd Font already installed"
    else
        if [ -f "$SCRIPT_DIR/data/SF-Mono-Nerd-Font-18.0d1e1.0.zip" ]; then
            echo "Installing SF Mono Nerd Font from bundled archive..."
            cd /tmp
            unzip -q -o "$SCRIPT_DIR/data/SF-Mono-Nerd-Font-18.0d1e1.0.zip" -d sfmono_extract
            mkdir -p "$FONT_DIR/SFMonoNerdFont"
            find sfmono_extract -name "*.otf" -exec mv {} "$FONT_DIR/SFMonoNerdFont/" \;
            rm -rf sfmono_extract
            echo "✓ SF Mono Nerd Font installed"
        else
            echo "⚠ SF Mono Nerd Font archive not found in data/"
        fi
    fi

    # Refresh cache
    fc-cache -fv "$FONT_DIR" > /dev/null 2>&1
    cd "$CURRENT_DIR"
}

# Font Management for WSL (Windows Subsystem for Linux)
handle_wsl_fonts() {
    # Check if we are in WSL
    if grep -qEi "(Microsoft|WSL)" /proc/version; then
        echo -e "\n🪟 WSL environment detected!"
        echo "Fonts must also be installed on Windows to be used in Windows Terminal."

        # Find current Windows username
        if command -v cmd.exe &> /dev/null; then
            WIN_USER=$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r')
        else
            WIN_USER=""
        fi

        if [ -n "$WIN_USER" ]; then
            WIN_DEST="/mnt/c/Users/$WIN_USER/Downloads/NerdFonts_Zsh_Setup"

            # Copy fonts to Windows only if they don't already exist or if in UPDATE_MODE
            if [ "$UPDATE_MODE" = true ] || [ ! -d "$WIN_DEST" ]; then
                echo "Copying fonts to Windows ($WIN_DEST)..."
                mkdir -p "$WIN_DEST"

                # Clean directory if in UPDATE_MODE
                if [ "$UPDATE_MODE" = true ]; then
                    rm -f "$WIN_DEST"/*.ttf "$WIN_DEST"/*.otf 2>/dev/null || true
                fi

                cp "$HOME/.local/share/fonts/"*.ttf "$WIN_DEST/" 2>/dev/null || true
                cp "$HOME/.local/share/fonts/JetBrainsMonoNerdFont/"* "$WIN_DEST/" 2>/dev/null || true
                cp "$HOME/.local/share/fonts/HackNerdFont/"* "$WIN_DEST/" 2>/dev/null || true
                cp "$HOME/.local/share/fonts/FiraMonoNerdFont/"* "$WIN_DEST/" 2>/dev/null || true
                cp "$HOME/.local/share/fonts/CousineNerdFont/"* "$WIN_DEST/" 2>/dev/null || true

                echo "✓ Fonts copied to Windows"
            else
                echo "✓ Fonts already copied to $WIN_DEST"
            fi

            # Find PowerShell script
            SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
            PS_SCRIPT="$SCRIPT_DIR/scripts/install-fonts-windows.ps1"

            if [ -f "$PS_SCRIPT" ] && command -v powershell.exe &> /dev/null; then
                echo ""
                echo "🚀 Automatic font installation on Windows..."

                # Convert WSL path to Windows path
                WIN_PS_SCRIPT=$(wslpath -w "$PS_SCRIPT")

                # Execute PowerShell script
                if powershell.exe -ExecutionPolicy Bypass -File "$WIN_PS_SCRIPT" 2>&1; then
                    echo "✓ Fonts automatically installed on Windows!"
                    echo ""
                    echo "⚠️  ACTION REQUIRED:"
                    echo "1. Restart Windows Terminal"
                    echo "2. Settings → Profiles → Ubuntu/WSL → Appearance"
                    echo "3. Font: 'MesloLGS NF'"
                else
                    echo "⚠️  Automatic installation failed. Manual procedure:"
                    echo ""
                    echo "1. Open the 'Download/NerdFonts_Zsh_Setup' folder on Windows"
                    echo "2. Select all .ttf/.otf files"
                    echo "3. Right-click → 'Install' (or 'Install for all users')"
                    echo "4. Configure Windows Terminal to use 'MesloLGS NF'"
                fi
            else
                echo ""
                if [ ! -f "$PS_SCRIPT" ]; then
                    echo "⚠️  PowerShell script not found. ACTION REQUIRED ON WINDOWS:"
                else
                    echo "⚠️  powershell.exe not found. ACTION REQUIRED ON WINDOWS:"
                fi
                echo "1. Open the 'Download/NerdFonts_Zsh_Setup' folder on Windows"
                echo "2. Select all .ttf/.otf files"
                echo "3. Right-click → 'Install' (or 'Install for all users')"
                echo "4. Configure Windows Terminal to use 'MesloLGS NF'"
            fi
        else
            echo "⚠️  Unable to determine Windows user. Manual copy required."
        fi
    fi
}

# Install eza
install_eza() {
    echo -e "\n📁 Installing eza (modern ls)..."

    if command -v eza &> /dev/null; then
        CURRENT_VERSION=$(eza --version | head -1)
        echo "✓ eza already installed ($CURRENT_VERSION)"

        if [ "$UPDATE_MODE" = true ]; then
            echo "🔄 Updating eza..."
            # If installed from repo, use package manager
            if [ "$OS" = "fedora" ] && sudo dnf list installed eza &> /dev/null; then
                sudo dnf update -y eza
            else
                # Reinstalla da GitHub
                update_eza_from_github
            fi
        else
            read -p "Do you want to update eza? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[YySs]$ ]]; then
                if [ "$OS" = "fedora" ] && sudo dnf list installed eza &> /dev/null; then
                    sudo dnf update -y eza
                else
                    update_eza_from_github
                fi
            fi
        fi
        return
    fi

    # Try from repos first
    if [ "$OS" = "fedora" ]; then
        echo "Attempting installation from Copr..."
        if sudo dnf copr enable -y atim/eza 2>/dev/null && sudo dnf install -y eza 2>/dev/null; then
            echo "✓ eza installed from Copr"
            return
        fi
    fi

    # Fallback: install from GitHub releases
    update_eza_from_github
}

# Helper to update eza from GitHub
update_eza_from_github() {
    echo "Installing from GitHub releases..."
    local CURRENT_DIR=$(pwd)
    cd /tmp
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then
        wget -q https://github.com/eza-community/eza/releases/latest/download/eza_x86_64-unknown-linux-gnu.tar.gz
        tar -xzf eza_x86_64-unknown-linux-gnu.tar.gz
        mkdir -p "$HOME/.local/bin"
        mv eza "$HOME/.local/bin/"
        chmod +x "$HOME/.local/bin/eza"
        rm eza_x86_64-unknown-linux-gnu.tar.gz
        NEW_VERSION=$(eza --version | head -1)
        echo "✓ eza installed/updated: $NEW_VERSION"
    else
        echo "⚠️  Architecture $ARCH not supported for automatic download"
        echo "   Install manually from: https://github.com/eza-community/eza/releases"
    fi
    cd "$CURRENT_DIR"
}

# Install jq (required for Claude Code status line)
install_jq() {
    echo -e "\n📊 Installing jq (JSON parser)..."

    if command -v jq &> /dev/null; then
        echo "✓ jq already installed"
        return
    fi

    if [ "$OS" = "fedora" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
        sudo dnf install -y jq
    elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        sudo apt install -y jq
    fi
}

# Configure Claude Code status line
install_claude_code_statusline() {
    echo -e "\n🔗 Configuring Claude Code Status Line..."

    # Check that jq is installed
    if ! command -v jq &> /dev/null; then
        echo "⚠️  jq not installed. Installing jq first..."
        install_jq
    fi

    # Create Claude hooks directory
    mkdir -p "$HOME/.claude/hooks"

    # Copy status line script from repository
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/data/claude-statusline-starship.sh" ]; then
        cp "$SCRIPT_DIR/data/claude-statusline-starship.sh" "$HOME/.claude/hooks/statusline-starship.sh"
        chmod +x "$HOME/.claude/hooks/statusline-starship.sh"
        echo "✓ Status line script copied from repository"
    else
        echo "⚠️  Status line script not found in data/, creating basic version..."
        # Fallback: create basic version if file doesn't exist
        cat > "$HOME/.claude/hooks/statusline-starship.sh" << 'EOF'
#!/bin/bash
# Starship-inspired status line for Claude Code
# Format: model [usage%] username@hostname directory git_branch git_status python_venv

input=$(cat)
model_display=$(echo "$input" | jq -r '.model.display_name // .model.id // "unknown"')
token_percentage=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
if [ -n "$token_percentage" ]; then
  token_display=$(printf "[%.0f%%]" "$token_percentage")
  model_display="$model_display $token_display"
fi
dir=$(echo "$input" | jq -r '.workspace.current_dir')
user=$(whoami)
host=$(hostname -s)
repo_root=$(cd "$dir" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)
if [ -n "$repo_root" ]; then
  rel_path=$(realpath --relative-to="$repo_root" "$dir" 2>/dev/null || echo ".")
  if [ "$rel_path" = "." ]; then
    display_dir=$(basename "$repo_root")
  else
    display_dir="$(basename "$repo_root")/$rel_path"
  fi
else
  display_dir=$(echo "$dir" | sed "s|^$HOME|home|")
fi
git_info=""
git_status_icon=""
if cd "$dir" 2>/dev/null && git rev-parse --git-dir >/dev/null 2>&1; then
  branch=$(git -c core.useBuiltinFSMonitor=false branch --show-current 2>/dev/null || echo "HEAD")
  git_icon=$(printf '\uf09b')
  git_info=" $git_icon $branch"
  status=$(git -c core.useBuiltinFSMonitor=false status --porcelain 2>/dev/null)
  if [ -n "$status" ]; then
    mod_icon=$(printf '\uf040')
    git_status_icon=" $mod_icon"
  fi
fi
venv=""
if [ -n "$VIRTUAL_ENV" ]; then
  py_icon=$(printf '\ue73c')
  venv=" $py_icon ($(basename "$VIRTUAL_ENV"))"
fi
printf '\033[36m%s\033[0m \033[37m%s\033[0m@\033[1;32m%s\033[0m \033[37m%s\033[0m\033[32m%s%s\033[0m\033[33m%s\033[0m' \
  "$model_display" "$user" "$host" "$display_dir" "$git_info" "$git_status_icon" "$venv"
EOF
        chmod +x "$HOME/.claude/hooks/statusline-starship.sh"
    fi

    # Create/update settings.json preserving other configurations
    if [ -f "$HOME/.claude/settings.json" ]; then
        # Existing backup
        cp "$HOME/.claude/settings.json" "$HOME/.claude/settings.json.backup.$(date +%Y%m%d_%H%M%S)"
        # Update only statusLine using jq (use absolute path instead of ~)
        jq --arg cmd "$HOME/.claude/hooks/statusline-starship.sh" \
            '. + {"statusLine": {"type": "command", "command": $cmd}}' \
            "$HOME/.claude/settings.json" > "$HOME/.claude/settings.json.tmp" && \
            mv "$HOME/.claude/settings.json.tmp" "$HOME/.claude/settings.json"
    else
        echo "{\"statusLine\": {\"type\": \"command\", \"command\": \"$HOME/.claude/hooks/statusline-starship.sh\"}}" > "$HOME/.claude/settings.json"
    fi

    echo "✓ Claude Code status line configured (Enhanced)"
    echo "  - Script: ~/.claude/hooks/statusline-starship.sh"
    echo "  - Config: ~/.claude/settings.json"
    echo "  - Features: Model name, token usage %, git status, Python venv"
}

# Install modern tools (optional)
install_modern_tools() {
    echo -e "\n🛠️  Installing modern tools (bat, ripgrep, fd, zoxide, fzf)..."

    local DO_INSTALL=false

    if [ "$YES_MODE" = true ] || [ "$UPDATE_MODE" = true ]; then
        DO_INSTALL=true
    else
        read -p "Install bat, ripgrep, fd, zoxide, fzf? These power the shell aliases. (Y/n) " -n 1 -r
        echo
        # Default to yes: empty reply or y/Y/s/S
        if [[ -z "$REPLY" || "$REPLY" =~ ^[YySs]$ ]]; then
            DO_INSTALL=true
        fi
    fi

    if [ "$DO_INSTALL" = true ]; then
        if [ "$OS" = "fedora" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
            sudo dnf install -y bat ripgrep fd-find zoxide fzf
        elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
            sudo apt install -y bat ripgrep fd-find fzf zoxide
        fi
        echo "✓ Modern tools installed"
    else
        echo "⊘ Modern tools skipped (aliases for bat/rg/fd/z won't be active)"
    fi
}

# Apply Starship configuration
apply_starship_config() {
    echo -e "\n⚙️  Applying Starship configuration..."

    mkdir -p "$HOME/.config"

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local SRC="$SCRIPT_DIR/starship.toml"

    if [ -f "$HOME/.config/starship.toml" ]; then
        if ! diff -q "$SRC" "$HOME/.config/starship.toml" &>/dev/null; then
            BACKUP="$HOME/.config/starship.toml.backup.$(date +%Y%m%d_%H%M%S)"
            cp "$HOME/.config/starship.toml" "$BACKUP"
            cp "$SRC" "$HOME/.config/starship.toml"
            echo "✓ starship.toml updated (backup: $BACKUP)"
            STARSHIP_UPDATED=true
        else
            echo "✓ starship.toml already up to date"
            STARSHIP_UNCHANGED=true
        fi
    else
        cp "$SRC" "$HOME/.config/starship.toml"
        echo "✓ starship.toml created"
        STARSHIP_UPDATED=true
    fi
}

# Configure .zshrc
configure_zshrc() {
    echo -e "\n📝 Configuring .zshrc..."

    ZSHRC="$HOME/.zshrc"

    # If .zshrc doesn't exist, create complete file from template
    if [ ! -f "$ZSHRC" ]; then
        echo "Creating new .zshrc..."
        create_new_zshrc
        echo "✓ .zshrc created"
        ZSHRC_UPDATED=true
        return
    fi

    # .zshrc exists: always merge to ensure all components are present
    BACKUP="$HOME/.zshrc.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$ZSHRC" "$BACKUP"
    merge_zshrc_config  # idempotent — only adds what is missing

    # Remove backup if no changes were made
    if [ "$ZSHRC_UNCHANGED" = true ]; then
        rm -f "$BACKUP"
    else
        echo "  (backup: $BACKUP)"
    fi
}

# Helper: create complete .zshrc from scratch
create_new_zshrc() {
    cat > "$HOME/.zshrc" << 'EOF'
# PATH and Environment
export PATH="$HOME/.local/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Oh My Zsh configuration
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME=""

# Plugins
plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting
    zsh-history-substring-search
    colored-man-pages
    command-not-found
)

source $ZSH/oh-my-zsh.sh

# Syntax highlighting — neutral, works on any tmux theme background
ZSH_HIGHLIGHT_STYLES[command]='bold'
ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=#cc7832,bold'
ZSH_HIGHLIGHT_STYLES[builtin]='bold'
ZSH_HIGHLIGHT_STYLES[alias]='bold,underline'
ZSH_HIGHLIGHT_STYLES[path]='underline'
ZSH_HIGHLIGHT_STYLES[globbing]='fg=#9a8060'
ZSH_HIGHLIGHT_STYLES[precommand]='bold,underline'
ZSH_HIGHLIGHT_STYLES[single-quoted-argument]='fg=#9a8060'
ZSH_HIGHLIGHT_STYLES[double-quoted-argument]='fg=#9a8060'
ZSH_HIGHLIGHT_STYLES[redirection]='bold'
ZSH_HIGHLIGHT_STYLES[comment]='italic,fg=#707070'

# Autosuggestions — neutral grey
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#707070'

# History substring search — bold only, no vivid colors
HISTORY_SUBSTRING_SEARCH_HIGHLIGHT_FOUND='bold'
HISTORY_SUBSTRING_SEARCH_HIGHLIGHT_NOT_FOUND='fg=#cc7832'

# FZF integration (if available)
if [ -f /usr/share/fzf/shell/key-bindings.zsh ]; then
    source /usr/share/fzf/shell/key-bindings.zsh
    export FZF_DEFAULT_OPTS='--height 40% --layout=reverse --border'
    export FZF_CTRL_T_OPTS="--preview 'bat --color=always --line-range :500 {} 2>/dev/null || cat {}'"
fi

# Modern aliases (if tools are available)
if command -v eza &> /dev/null; then
    alias ls='eza --icons --group-directories-first'
    alias ll='eza -l --icons --group-directories-first'
    alias la='eza -la --icons --group-directories-first'
    alias lt='eza --tree --icons --group-directories-first --git-ignore --ignore-glob="venv|.venv|env|.env|node_modules|.git"'
    alias lta='eza --tree --icons --group-directories-first'
    alias lsga='eza --tree --icons --group-directories-first --git'
    alias lsg3='eza --tree --level 3 --icons --group-directories-first --git'
    alias lsgm='git status -s'
fi

if command -v bat &> /dev/null; then
    alias cat='bat --style=auto'
fi

if command -v rg &> /dev/null; then
    alias grep='rg'
fi

if command -v fd &> /dev/null; then
    alias find='fd'
fi

if command -v zoxide &> /dev/null; then
    alias cd='z'
fi

# Tmux aliases
alias ta='tmux attach -t'
alias tl='tmux ls'
alias tn='tmux new -s'
alias tk='tmux kill-session -t'
alias tw='tmux new-window'
alias tsp='tmux split-window -v'
alias tsh='tmux split-window -h'

# Tmux alias help
th() {
    echo ""
    echo "  TMUX ALIASES"
    echo "  ------------------------------------"
    echo "  ta <name>    attach to session"
    echo "  tl           list sessions"
    echo "  tn <name>    new session with name"
    echo "  tk <name>    kill session"
    echo "  tw           new window"
    echo "  tsp          split vertical (↕)"
    echo "  tsh          split horizontal (↔)"
    echo "  ttheme <n>   apply theme to session"
    echo ""
    echo "  AVAILABLE THEMES"
    echo "  ------------------------------------"
    echo "  cobalt  green  blue  purple  orange"
    echo "  red     nord   everforest   gruvbox"
    echo "  cream"
    echo ""
    echo "  AUTO THEMES (from session name)"
    echo "  ------------------------------------"
    echo "  *dev* *code*     → green"
    echo "  *research* *doc* → blue"
    echo "  *debug* *test*   → orange"
    echo "  *prod* *urgent*  → red"
    echo ""
}

# Apply tmux theme to current session: ttheme green
ttheme() {
    if [ -z "$TMUX" ]; then
        echo "ttheme: not inside a tmux session"
        return 1
    fi
    local theme="${1:-cobalt}"
    local session
    session=$(tmux display-message -p '#S' 2>/dev/null)
    if [ -z "$session" ]; then
        echo "ttheme: could not determine session name"
        return 1
    fi
    if [ ! -f "$HOME/.tmux/themes.sh" ]; then
        echo "ttheme: $HOME/.tmux/themes.sh not found — run: zsc update"
        return 1
    fi
    if ! bash "$HOME/.tmux/themes.sh" "$theme" "$session"; then
        echo "ttheme: theme may be missing from your installed themes — run: zsc update"
        return 1
    fi
}

# Starship prompt
if command -v starship &> /dev/null; then
    eval "$(starship init zsh)"
fi

# NVM (if installed)
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Bun completions (if installed)
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"

# Alias for dotfiles management (Bare Git Repository) — only if ~/.cfg exists
if [ -d "$HOME/.cfg" ]; then
    alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'
fi

# Disable non-essential traffic and telemetry
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
export DISABLE_TELEMETRY=1
export DISABLE_ERROR_REPORTING=1

# Zoxide initialization (must be last)
if command -v zoxide &> /dev/null; then
    eval "$(zoxide init zsh)"
fi
EOF
}

# Helper: merge configuration in existing .zshrc
merge_zshrc_config() {
    echo "Updating missing elements in .zshrc..."

    ZSHRC="$HOME/.zshrc"
    local CHANGES_MADE=false

    # Add missing plugins
    REQUIRED_PLUGINS=("zsh-autosuggestions" "zsh-syntax-highlighting" "zsh-history-substring-search")
    for plugin in "${REQUIRED_PLUGINS[@]}"; do
        if ! grep -q "$plugin" "$ZSHRC"; then
            echo "  + Adding plugin: $plugin"
            if grep -q "^plugins=.*)" "$ZSHRC"; then
                # Single-line format: plugins=(git) → plugins=(git plugin)
                sed -i "/^plugins=(/s/)$/ $plugin)/" "$ZSHRC"
            else
                # Multi-line format: append after plugins=( line
                sed -i "/^plugins=(/a\    $plugin" "$ZSHRC"
            fi
            CHANGES_MADE=true
        fi
    done

    # Check PATH for .local/bin (Add at beginning if missing)
    if ! grep -q 'PATH.*\.local/bin' "$ZSHRC"; then
        echo '  + Adding PATH: ~/.local/bin'
        sed -i '1i export PATH="$HOME/.local/bin:$PATH"' "$ZSHRC"
        CHANGES_MADE=true
    fi

    # Check SPECIFIC eza aliases (check each one individually)
    if command -v eza &> /dev/null; then
        local EZA_SECTION_EXISTS=$(grep -q "alias ls=.*eza" "$ZSHRC" && echo true || echo false)

        # Check for specific new aliases that may be missing
        if ! grep -q "alias lsga=" "$ZSHRC"; then
            echo "  + Adding alias: lsga (eza tree with git status)"
            if [ "$EZA_SECTION_EXISTS" = true ]; then
                # Add to existing eza section
                sed -i "/alias lta=/a\    alias lsga='eza --tree --icons --group-directories-first --git'  # tree ALL with git status" "$ZSHRC"
            else
                # Create new section with all aliases
                cat >> "$ZSHRC" << 'EOF'

# Alias eza (modern ls)
if command -v eza &> /dev/null; then
    alias ls='eza --icons --group-directories-first'
    alias ll='eza -l --icons --group-directories-first'
    alias la='eza -la --icons --group-directories-first'
    alias lt='eza --tree --icons --group-directories-first --git-ignore --ignore-glob="venv|.venv|env|.env|node_modules|.git"'
    alias lta='eza --tree --icons --group-directories-first'  # tree ALL (senza esclusioni)
    alias lsga='eza --tree --icons --group-directories-first --git'  # tree ALL con git status
    alias lsg3='eza --tree --level 3 --icons --group-directories-first --git'  # tree 3 livelli con git status
    alias lsgm='git status -s'  # solo file modificati (git)
fi
EOF
                EZA_SECTION_EXISTS=true
            fi
            CHANGES_MADE=true
        fi

        if ! grep -q "alias lsg3=" "$ZSHRC"; then
            echo "  + Adding alias: lsg3 (eza tree 3 levels with git)"
            if [ "$EZA_SECTION_EXISTS" = true ]; then
                sed -i "/alias lsga=/a\    alias lsg3='eza --tree --level 3 --icons --group-directories-first --git'  # tree 3 levels with git status" "$ZSHRC"
            fi
            CHANGES_MADE=true
        fi

        if ! grep -q "alias lsgm=" "$ZSHRC"; then
            echo "  + Adding alias: lsgm (git status -s)"
            if [ "$EZA_SECTION_EXISTS" = true ]; then
                sed -i "/alias lsg3=/a\    alias lsgm='git status -s'  # modified files only (git)" "$ZSHRC"
            fi
            CHANGES_MADE=true
        fi
    fi

    # Check Bun configuration
    if ! grep -q "BUN_INSTALL" "$ZSHRC"; then
        echo "  + Adding Bun configuration"
        cat >> "$ZSHRC" << 'EOF'

# Bun completions (se installato)
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"

# Bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
EOF
        CHANGES_MADE=true
    fi

    # Check dotfiles bare git alias — only add if ~/.cfg exists
    if [ -d "$HOME/.cfg" ] && ! grep -q "alias config=" "$ZSHRC"; then
        echo "  + Adding dotfiles alias (config) — ~/.cfg detected"
        cat >> "$ZSHRC" << 'EOF'

# Alias for dotfiles management (Bare Git Repository) — only if ~/.cfg exists
if [ -d "$HOME/.cfg" ]; then
    alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'
fi
EOF
        CHANGES_MADE=true
    fi

    # Check Claude Code environment variables
    if ! grep -q "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC" "$ZSHRC"; then
        echo "  + Adding Claude Code environment variables"
        cat >> "$ZSHRC" << 'EOF'

# Disable non-essential traffic and telemetry
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
export DISABLE_TELEMETRY=1
export DISABLE_ERROR_REPORTING=1
EOF
        CHANGES_MADE=true
    fi

    # Check tmux aliases and ttheme function
    if ! grep -q "alias ta=" "$ZSHRC"; then
        echo "  + Adding tmux aliases and ttheme"
        cat >> "$ZSHRC" << 'EOF'

# Tmux aliases
alias ta='tmux attach -t'
alias tl='tmux ls'
alias tn='tmux new -s'
alias tk='tmux kill-session -t'
alias tw='tmux new-window'
alias tsp='tmux split-window -v'
alias tsh='tmux split-window -h'

# Tmux alias help
th() {
    echo ""
    echo "  TMUX ALIASES"
    echo "  ------------------------------------"
    echo "  ta <name>    attach to session"
    echo "  tl           list sessions"
    echo "  tn <name>    new session with name"
    echo "  tk <name>    kill session"
    echo "  tw           new window"
    echo "  tsp          split vertical (↕)"
    echo "  tsh          split horizontal (↔)"
    echo "  ttheme <n>   apply theme to session"
    echo ""
    echo "  AVAILABLE THEMES"
    echo "  ------------------------------------"
    echo "  cobalt  green  blue  purple  orange"
    echo "  red     nord   everforest   gruvbox"
    echo "  cream"
    echo ""
    echo "  AUTO THEMES (from session name)"
    echo "  ------------------------------------"
    echo "  *dev* *code*     → green"
    echo "  *research* *doc* → blue"
    echo "  *debug* *test*   → orange"
    echo "  *prod* *urgent*  → red"
    echo ""
}

# Apply tmux theme to current session: ttheme green
ttheme() {
    local session
    session=$(tmux display-message -p '#S' 2>/dev/null)
    if [ -z "$session" ]; then
        echo "No active tmux session"
        return 1
    fi
    if ! bash -c "source ~/.tmux/themes.sh && apply_theme '$1' '$session'"; then
        echo "ttheme: theme may be missing from your installed themes — run: zsc update"
        return 1
    fi
}
EOF
        CHANGES_MADE=true
    fi

    # Check neutral syntax highlighting
    if ! grep -q "ZSH_HIGHLIGHT_STYLES\[command\]='bold'" "$ZSHRC"; then
        echo "  + Updating zsh-syntax-highlighting to neutral styles"
        cat >> "$ZSHRC" << 'EOF'

# Syntax highlighting — neutral, works on any tmux theme background
ZSH_HIGHLIGHT_STYLES[command]='bold'
ZSH_HIGHLIGHT_STYLES[unknown-token]='fg=#cc7832,bold'
ZSH_HIGHLIGHT_STYLES[builtin]='bold'
ZSH_HIGHLIGHT_STYLES[alias]='bold,underline'
ZSH_HIGHLIGHT_STYLES[path]='underline'
ZSH_HIGHLIGHT_STYLES[globbing]='fg=#9a8060'
ZSH_HIGHLIGHT_STYLES[precommand]='bold,underline'
ZSH_HIGHLIGHT_STYLES[single-quoted-argument]='fg=#9a8060'
ZSH_HIGHLIGHT_STYLES[double-quoted-argument]='fg=#9a8060'
ZSH_HIGHLIGHT_STYLES[redirection]='bold'
ZSH_HIGHLIGHT_STYLES[comment]='italic,fg=#707070'

# Autosuggestions — neutral grey
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#707070'

# History substring search — bold only, no vivid colors
HISTORY_SUBSTRING_SEARCH_HIGHLIGHT_FOUND='bold'
HISTORY_SUBSTRING_SEARCH_HIGHLIGHT_NOT_FOUND='fg=#cc7832'
EOF
        CHANGES_MADE=true
    fi

    # Check Starship init
    if ! grep -q "starship init zsh" "$ZSHRC"; then
        echo "  + Adding Starship prompt init"
        cat >> "$ZSHRC" << 'EOF'

# Starship prompt
if command -v starship &> /dev/null; then
    eval "$(starship init zsh)"
fi
EOF
        CHANGES_MADE=true
    fi

    # Check ttheme function (the standalone bash script version)
    if ! grep -q "bash.*themes.sh.*theme.*session\|apply_theme" "$ZSHRC"; then
        echo "  + Adding ttheme function (themes.sh standalone)"
        cat >> "$ZSHRC" << 'EOF'

# Apply tmux theme to current session: ttheme green
ttheme() {
    if [ -z "$TMUX" ]; then
        echo "ttheme: not inside a tmux session"
        return 1
    fi
    local theme="${1:-cobalt}"
    local session
    session=$(tmux display-message -p '#S' 2>/dev/null)
    if [ -z "$session" ]; then
        echo "ttheme: could not determine session name"
        return 1
    fi
    if [ ! -f "$HOME/.tmux/themes.sh" ]; then
        echo "ttheme: $HOME/.tmux/themes.sh not found — run: zsc update"
        return 1
    fi
    if ! bash "$HOME/.tmux/themes.sh" "$theme" "$session"; then
        echo "ttheme: theme may be missing from your installed themes — run: zsc update"
        return 1
    fi
}
EOF
        CHANGES_MADE=true
    fi

    # Check zoxide init (must be LAST)
    if ! grep -q "zoxide init zsh" "$ZSHRC"; then
        echo "  + Adding zoxide init (at end of file)"
        cat >> "$ZSHRC" << 'EOF'

# Zoxide initialization (must be last)
if command -v zoxide &> /dev/null; then
    eval "$(zoxide init zsh)"
fi
EOF
        CHANGES_MADE=true
    elif ! tail -15 "$ZSHRC" | grep -q "zoxide init zsh"; then
        echo "  ⚠️  zoxide init found but not at end of file — manually move to end of .zshrc"
    fi

    if [ "$CHANGES_MADE" = true ]; then
        echo "✓ .zshrc updated with new configurations"
        ZSHRC_UPDATED=true
    else
        echo "✓ .zshrc already complete, no update needed"
        ZSHRC_UNCHANGED=true
    fi
}

# Helper: add only Starship to existing .zshrc
add_starship_to_existing_zshrc() {
    ZSHRC="$HOME/.zshrc"

    # Add Starship init at end
    cat >> "$ZSHRC" << 'EOF'

# Starship prompt (added by xzsc installer)
if command -v starship &> /dev/null; then
    eval "$(starship init zsh)"
fi
EOF

    # Add PATH if missing
    if ! grep -q 'PATH.*\.local/bin' "$ZSHRC"; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$ZSHRC"
    fi

    echo "✓ Starship added to .zshrc"
}

# Change shell to zsh
change_shell_to_zsh() {
    echo -e "\n🐚 Changing default shell to Zsh..."

    local ZSH_PATH
    ZSH_PATH="$(which zsh)"

    # Check both $SHELL and getent (handles cases where SHELL env isn't updated yet)
    local CURRENT_SHELL
    CURRENT_SHELL=$(getent passwd "$USER" 2>/dev/null | cut -d: -f7 || echo "$SHELL")

    if [ "$CURRENT_SHELL" = "$ZSH_PATH" ] || [ "$SHELL" = "$ZSH_PATH" ]; then
        echo "✓ Zsh already default shell"
    elif [ "$YES_MODE" = true ] || [ "$UPDATE_MODE" = true ]; then
        chsh -s "$ZSH_PATH"
        echo "✓ Shell changed to Zsh (requires logout)"
    else
        read -p "Do you want to set Zsh as default shell? (Y/n) " -n 1 -r
        echo
        if [[ -z "$REPLY" || "$REPLY" =~ ^[YySs]$ ]]; then
            chsh -s "$ZSH_PATH"
            echo "✓ Shell changed to Zsh (requires logout)"
        fi
    fi
}

# Post-installation verification
verify_installation() {
    echo -e "\n🔍 Verifying installation..."
    echo ""

    ERRORS=0
    WARNINGS=0

    # Check Zsh
    if command -v zsh &> /dev/null; then
        ZSH_VER=$(zsh --version | cut -d' ' -f2)
        echo "✓ Zsh: v$ZSH_VER"
    else
        echo "❌ Zsh not found"
        ((ERRORS++))
    fi

    # Check Oh My Zsh
    if [ -d "$HOME/.oh-my-zsh" ]; then
        echo "✓ Oh My Zsh: installed"
    else
        echo "❌ Oh My Zsh not found"
        ((ERRORS++))
    fi

    # Check Zsh plugins
    ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"
    if [ -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
        echo "✓ Plugin zsh-autosuggestions: installed"
    else
        echo "⚠️  Plugin zsh-autosuggestions not found"
        ((WARNINGS++))
    fi

    # Check Starship
    if command -v starship &> /dev/null; then
        STARSHIP_VER=$(starship --version | grep -oP 'starship \K[\d.]+' || echo "unknown")
        echo "✓ Starship: v$STARSHIP_VER"

        # Check Starship config
        if [ -f "$HOME/.config/starship.toml" ]; then
            echo "✓ Starship configuration: present"
        else
            echo "⚠️  Starship configuration not found"
            ((WARNINGS++))
        fi

        # Test Starship rendering
        if [ "$VERBOSE" = true ]; then
            TEST_OUTPUT=$(starship prompt 2>&1)
            if [ $? -eq 0 ]; then
                echo "✓ Starship rendering test: OK"
            else
                echo "⚠️  Starship warning: $TEST_OUTPUT"
                ((WARNINGS++))
            fi
        fi
    else
        echo "❌ Starship not found"
        ((ERRORS++))
    fi

    # Check Nerd Fonts
    if fc-list | grep -qi "MesloLGS NF"; then
        echo "✓ Font MesloLGS NF: installed"
    else
        echo "⚠️  Font MesloLGS NF not installed"
        ((WARNINGS++))
    fi

    # Check eza
    if command -v eza &> /dev/null; then
        EZA_VER=$(eza --version | head -1)
        echo "✓ eza: $EZA_VER"
    else
        echo "⚠️  eza not installed (optional)"
    fi

    # Check jq (for Claude Code)
    if command -v jq &> /dev/null; then
        echo "✓ jq: installed"
    else
        echo "⚠️  jq not installed (required for Claude Code)"
        ((WARNINGS++))
    fi

    # Check Claude Code statusline
    if [ -f "$HOME/.claude/hooks/statusline-starship.sh" ]; then
        echo "✓ Claude Code statusline: configured"
    else
        echo "⚠️  Claude Code statusline not configured"
    fi

    # Check tmux
    if command -v tmux &>/dev/null; then
        echo "✓ tmux: $(tmux -V)"
    else
        echo "⚠️  tmux not installed (optional)"
    fi

    # Check TPM
    if [ -d "$HOME/.tmux/plugins/tpm" ]; then
        echo "✓ TPM: installed"
    else
        echo "⚠️  TPM not installed (required for tmux plugins)"
    fi

    # Check tmux themes
    if [ -f "$HOME/.tmux/themes.sh" ]; then
        echo "✓ Tmux themes: installed"
    else
        echo "⚠️  Tmux themes not installed"
    fi

    # Check .zshrc
    if [ -f "$HOME/.zshrc" ]; then
        if grep -q "starship init zsh" "$HOME/.zshrc"; then
            echo "✓ .zshrc: configured with Starship"
        else
            echo "⚠️  .zshrc does not contain Starship init"
            ((WARNINGS++))
        fi
    else
        echo "❌ .zshrc not found"
        ((ERRORS++))
    fi

    # Summary
    echo ""
    echo "==================================="
    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo "✅ All verifications passed!"
    elif [ $ERRORS -eq 0 ]; then
        echo "✅ Installation completed with $WARNINGS warnings"
    else
        echo "⚠️  Installation completed with $ERRORS errors and $WARNINGS warnings"
        return 1
    fi
    echo "==================================="
}

# Show update summary
show_update_summary() {
    # Only show in UPDATE_MODE or if changes were made
    if [ "$UPDATE_MODE" = true ] || [ "$STARSHIP_UPDATED" = true ] || [ "$ZSHRC_UPDATED" = true ]; then
        echo ""
        echo "==================================="
        echo "📋 Update Summary"
        echo "==================================="

        # Starship status
        if [ "$STARSHIP_UPDATED" = true ]; then
            echo "starship.toml: ✅ Updated"
        elif [ "$STARSHIP_SKIPPED" = true ]; then
            echo "starship.toml: ⊘ Skipped (user choice)"
        elif [ "$STARSHIP_UNCHANGED" = true ]; then
            echo "starship.toml: ✓ Already up to date"
        fi

        # Zshrc status
        if [ "$ZSHRC_UPDATED" = true ]; then
            echo ".zshrc: ✅ Updated with new configurations"
            # List what was added (if in verbose mode or always)
            if [ "$VERBOSE" = true ] || [ "$UPDATE_MODE" = true ]; then
                echo "  New additions may include:"
                echo "    • Custom eza aliases (lsga, lsg3, lsgm)"
                echo "    • Bun configuration"
                echo "    • Dotfiles git alias (config)"
                echo "    • Claude Code environment variables"
            fi
        elif [ "$ZSHRC_SKIPPED" = true ]; then
            echo ".zshrc: ⊘ Skipped (user choice)"
        elif [ "$ZSHRC_UNCHANGED" = true ]; then
            echo ".zshrc: ✓ Already up to date"
        fi

        echo "==================================="
    fi
}

# Patch .tmux.conf: replace ZSHELL_PATH placeholder with actual zsh binary
patch_tmux_conf() {
    local conf="$1"
    local zsh_path
    zsh_path=$(command -v zsh 2>/dev/null || echo "/bin/zsh")
    sed -i "s|ZSHELL_PATH|$zsh_path|g" "$conf"

    # Warn if tmux < 3.0 (dual status bar requires tmux 3.0+)
    local tmux_major
    tmux_major=$(tmux -V 2>/dev/null | grep -oP '\d+' | head -1)
    if [ -n "$tmux_major" ] && [ "$tmux_major" -lt 3 ]; then
        echo "  ⚠️  tmux ${tmux_major}.x detected — dual status bar requires tmux 3.0+. Consider upgrading."
    fi
}

# Install tmux + TPM + plugins + themes
install_tmux() {
    echo -e "\n🖥️  Installing tmux + themes + plugins..."

    # Install tmux
    if ! command -v tmux &>/dev/null; then
        echo "Installing tmux..."
        if [ "$OS" = "fedora" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
            sudo dnf install -y tmux
        elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
            sudo apt install -y tmux
        fi
        echo "✓ tmux installed ($(tmux -V))"
    else
        echo "✓ tmux already installed ($(tmux -V))"
    fi

    # Create ~/.tmux directory
    mkdir -p "$HOME/.tmux"

    # Install TPM
    if [ ! -d "$HOME/.tmux/plugins/tpm" ]; then
        echo "Installing TPM (Tmux Plugin Manager)..."
        git clone https://github.com/tmux-plugins/tpm "$HOME/.tmux/plugins/tpm"
        echo "✓ TPM installed"
    else
        if [ "$UPDATE_MODE" = true ]; then
            echo "Updating TPM..."
            git -C "$HOME/.tmux/plugins/tpm" pull --quiet
            echo "✓ TPM updated"
        else
            echo "✓ TPM already installed"
        fi
    fi

    # Copy .tmux.conf
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/data/tmux.conf" ]; then
        if [ -f "$HOME/.tmux.conf" ]; then
            if ! diff -q "$SCRIPT_DIR/data/tmux.conf" "$HOME/.tmux.conf" &>/dev/null; then
                echo "⚠️  .tmux.conf differs from repository version"
                if [ "$UPDATE_MODE" = true ] || [ "$YES_MODE" = true ]; then
                    BACKUP="$HOME/.tmux.conf.backup.$(date +%Y%m%d_%H%M%S)"
                    cp -f "$HOME/.tmux.conf" "$BACKUP"
                    cp -f "$SCRIPT_DIR/data/tmux.conf" "$HOME/.tmux.conf"
                    patch_tmux_conf "$HOME/.tmux.conf"
                    echo "✓ .tmux.conf updated (backup: $BACKUP)"
                else
                    read -p "Apply tmux config? Current config will be backed up. (Y/n) " -n 1 -r
                    echo
                    if [[ -z "$REPLY" || "$REPLY" =~ ^[YySs]$ ]]; then
                        BACKUP="$HOME/.tmux.conf.backup.$(date +%Y%m%d_%H%M%S)"
                        cp -f "$HOME/.tmux.conf" "$BACKUP"
                        cp -f "$SCRIPT_DIR/data/tmux.conf" "$HOME/.tmux.conf"
                        patch_tmux_conf "$HOME/.tmux.conf"
                        echo "✓ .tmux.conf updated (backup: $BACKUP)"
                    else
                        echo "⊘ .tmux.conf update skipped"
                    fi
                fi
            else
                echo "✓ .tmux.conf already up to date"
            fi
        else
            cp "$SCRIPT_DIR/data/tmux.conf" "$HOME/.tmux.conf"
            patch_tmux_conf "$HOME/.tmux.conf"
            echo "✓ .tmux.conf created"
        fi
    fi

    # Copy themes + status scripts
    cp "$SCRIPT_DIR/data/themes.sh" "$HOME/.tmux/themes.sh"
    chmod +x "$HOME/.tmux/themes.sh"
    cp "$SCRIPT_DIR/data/apply-theme-hook.sh" "$HOME/.tmux/apply-theme-hook.sh"
    chmod +x "$HOME/.tmux/apply-theme-hook.sh"

    mkdir -p "$HOME/.tmux/scripts"
    if [ -f "$SCRIPT_DIR/data/git-pane-status.sh" ]; then
        cp "$SCRIPT_DIR/data/git-pane-status.sh" "$HOME/.tmux/scripts/git-pane-status.sh"
        chmod +x "$HOME/.tmux/scripts/git-pane-status.sh"
    fi

    echo "✓ Tmux themes installed (graphite, paper, cobalt, green, blue, purple, orange, red, nord, everforest, gruvbox + light variants)"

    # Install TPM plugins by cloning directly (no tmux server required)
    echo "Installing TPM plugins..."
    local PLUGINS=(
        "tmux-plugins/tmux-sensible"
        "tmux-plugins/tmux-yank"
        "tmux-plugins/tmux-resurrect"
        "tmux-plugins/tmux-continuum"
    )
    for plugin in "${PLUGINS[@]}"; do
        plugin_name=$(basename "$plugin")
        plugin_dir="$HOME/.tmux/plugins/$plugin_name"
        if [ ! -d "$plugin_dir" ]; then
            git clone --depth=1 "https://github.com/$plugin" "$plugin_dir" 2>/dev/null
            echo "  ✓ $plugin_name"
        else
            if [ "$UPDATE_MODE" = true ]; then
                git -C "$plugin_dir" pull --quiet 2>/dev/null && echo "  ✓ $plugin_name updated"
            else
                echo "  ✓ $plugin_name already installed"
            fi
        fi
    done
    echo "✓ Plugins installed"
}

# Main
main() {
    # --status mode: just verify and exit
    if [ "$STATUS_MODE" = true ]; then
        detect_os
        verify_installation
        exit 0
    fi

    # --only <component> mode: run a single component and exit
    if [ -n "$ONLY_COMPONENT" ]; then
        detect_os
        case "$ONLY_COMPONENT" in
            eza)            install_eza ;;
            tmux)           install_tmux ;;
            starship)       install_starship ;;
            fonts)          install_nerd_fonts ;;
            zshrc)          configure_zshrc ;;
            omz)            install_oh_my_zsh ;;
            plugins)        install_zsh_plugins ;;
            statusline)     install_claude_code_statusline ;;
            tools)          install_modern_tools ;;
            *)
                echo "Unknown component: $ONLY_COMPONENT"
                exit 1
                ;;
        esac
        verify_installation
        exit 0
    fi

    # Full install / update path
    install_base_packages
    install_oh_my_zsh
    install_zsh_plugins
    install_starship
    install_nerd_fonts
    handle_wsl_fonts
    install_eza
    install_jq
    install_tmux
    apply_starship_config          # IMPORTANTE: prima di Claude Code statusline
    install_claude_code_statusline  # Usa la config Starship
    install_modern_tools
    configure_zshrc
    change_shell_to_zsh

    # Installation verification
    verify_installation

    # Show update summary
    show_update_summary

    echo -e "\n==================================="
    if [ "$UPDATE_MODE" = true ]; then
        echo "✅ Update completed!"
    else
        echo "✅ Installation completed!"
    fi
    echo "==================================="
    echo ""
    echo "⚠️  NEXT STEPS:"
    echo "1. Configure terminal to use 'MesloLGS NF' or 'JetBrainsMono Nerd Font'"
    echo "2. Close and reopen terminal (or run: source ~/.zshrc)"
    echo "3. If you changed shell, logout and login"
    echo ""
    echo "🔗 Claude Code status line configured! Restart Claude Code to see it."
    echo ""
    echo "📖 For more information, read README.md"
    echo ""

    # Tips for UPDATE_MODE
    if [ "$UPDATE_MODE" = true ]; then
        echo "💡 TIP: If you performed an update, run 'source ~/.zshrc' to reload the config"
        echo ""
    fi

    # Save installed version for tracking
    if [ -f "$SCRIPT_DIR/VERSION" ]; then
        RELEASE_VERSION=$(cat "$SCRIPT_DIR/VERSION")
        echo "$RELEASE_VERSION" > "$HOME/.xzsc-version"
    fi
}

main
