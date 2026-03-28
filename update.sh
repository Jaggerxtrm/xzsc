#!/bin/bash
# Smart Update Script for Zsh Starship Config
# This script safely updates existing configurations with version tracking

set -e

# Prevent sourcing the script (which would exit the terminal session)
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    echo "Error: This script should not be sourced. Run it as: ./update.sh"
    return 1 2>/dev/null || exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
BLUE=$'\033[0;34m'
NC=$'\033[0m' # No Color

echo "================================================"
echo "🔄 Zsh Starship Config - Smart Update"
echo "================================================"
echo ""

# Check if this is a git repository
if [ -d ".git" ]; then
    echo "${BLUE}📥 Checking for repository updates...${NC}"

    # Fetch latest changes
    git fetch origin master 2>/dev/null || git fetch 2>/dev/null || true

    # Check if there are updates
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "$LOCAL")

    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "${YELLOW}⚠️  New version available in repository${NC}"
        echo ""
        echo "Recent changes:"
        git log --oneline --no-decorate HEAD..@{u} 2>/dev/null | head -5 || true
        echo ""
        read -p "Pull latest changes? (s/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            if git pull; then
                echo "${GREEN}✓ Repository updated${NC}"
            else
                echo "${RED}❌ Failed to update repository${NC}"
                echo "You may need to resolve conflicts manually"
                exit 1
            fi
        else
            echo "${YELLOW}⊘ Skipping repository update${NC}"
        fi
    else
        echo "${GREEN}✓ Repository already up to date${NC}"
    fi
    echo ""
else
    echo "${YELLOW}⚠️  Not a git repository - cannot check for updates${NC}"
    echo "Consider cloning from: https://github.com/Jaggerxtrm/xzsc"
    echo ""
fi

# Load version information
if [ -f ".config-version" ]; then
    source .config-version
    REPO_VERSION="$STARSHIP_CONFIG_VERSION"
else
    REPO_VERSION="unknown"
fi

if [ -f "VERSION" ]; then
    RELEASE_VERSION=$(cat VERSION)
else
    RELEASE_VERSION="unknown"
fi

echo "================================================"
echo "Version Information"
echo "================================================"
echo "Release: v$RELEASE_VERSION"
echo "Config Version: v$REPO_VERSION"
echo ""

# Check installed versions
INSTALLED_VERSION_FILE="$HOME/.xzsc-version"
if [ -f "$INSTALLED_VERSION_FILE" ]; then
    INSTALLED_VERSION=$(cat "$INSTALLED_VERSION_FILE")
    echo "Installed Version: v$INSTALLED_VERSION"

    if [ "$INSTALLED_VERSION" = "$RELEASE_VERSION" ]; then
        echo "${GREEN}✓ You have the latest version${NC}"
    else
        echo "${YELLOW}⚠️  Update available: v$INSTALLED_VERSION → v$RELEASE_VERSION${NC}"
    fi
else
    echo "Installed Version: ${YELLOW}unknown (first-time setup?)${NC}"
fi
echo ""

# Check what needs updating
echo "================================================"
echo "Checking Configuration Files"
echo "================================================"

NEEDS_UPDATE=false

# Check starship.toml
if [ -f "$HOME/.config/starship.toml" ] && [ -f "starship.toml" ]; then
    if ! diff -q "starship.toml" "$HOME/.config/starship.toml" &>/dev/null; then
        echo "${YELLOW}⚠️  starship.toml${NC}: Differs from repository"
        NEEDS_UPDATE=true
    else
        echo "${GREEN}✓ starship.toml${NC}: Up to date"
    fi
else
    echo "${YELLOW}⚠️  starship.toml${NC}: Not installed"
    NEEDS_UPDATE=true
fi

# Check .zshrc for new features
MISSING_FEATURES=""
if [ -f "$HOME/.zshrc" ]; then
    # Check for specific new features
    if ! grep -q "alias lsga=" "$HOME/.zshrc"; then
        MISSING_FEATURES="${MISSING_FEATURES}  • lsga alias (eza tree with git)\n"
    fi
    if ! grep -q "alias lsg3=" "$HOME/.zshrc"; then
        MISSING_FEATURES="${MISSING_FEATURES}  • lsg3 alias (eza 3-level tree)\n"
    fi
    if ! grep -q "alias lsgm=" "$HOME/.zshrc"; then
        MISSING_FEATURES="${MISSING_FEATURES}  • lsgm alias (git status -s)\n"
    fi
    if ! grep -q "BUN_INSTALL" "$HOME/.zshrc"; then
        MISSING_FEATURES="${MISSING_FEATURES}  • Bun configuration\n"
    fi
    if ! grep -q "alias config=" "$HOME/.zshrc"; then
        MISSING_FEATURES="${MISSING_FEATURES}  • Dotfiles git alias\n"
    fi
    if ! grep -q "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC" "$HOME/.zshrc"; then
        MISSING_FEATURES="${MISSING_FEATURES}  • Claude Code env vars\n"
    fi

    if [ -n "$MISSING_FEATURES" ]; then
        echo "${YELLOW}⚠️  .zshrc${NC}: Missing new features:"
        echo -e "$MISSING_FEATURES"
        NEEDS_UPDATE=true
    else
        echo "${GREEN}✓ .zshrc${NC}: Has all features"
    fi
else
    echo "${YELLOW}⚠️  .zshrc${NC}: Not found"
    NEEDS_UPDATE=true
fi

echo ""

# Decide whether to proceed
if [ "$NEEDS_UPDATE" = false ]; then
    echo "${GREEN}✅ Everything is up to date!${NC}"
    echo ""
    echo "No update needed. Your configuration matches the repository."
    exit 0
fi

echo "================================================"
echo "Update Options"
echo "================================================"
echo ""
echo "This update will:"
echo "  1. Backup existing configurations"
echo "  2. Update starship.toml (if changed)"
echo "  3. Add missing features to .zshrc"
echo "  4. Preserve your customizations"
echo ""
read -p "Proceed with update? (s/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "${YELLOW}⊘ Update cancelled${NC}"
    exit 0
fi

echo ""
echo "================================================"
echo "Running Update Process"
echo "================================================"
echo ""

# Run install.sh in update mode with verbose output
./install.sh --update --verbose

# Save installed version
echo "$RELEASE_VERSION" > "$INSTALLED_VERSION_FILE"

echo ""
echo "${GREEN}✅ Update completed successfully!${NC}"
echo ""
echo "================================================"
echo "Next Steps"
echo "================================================"
echo "1. Reload your shell: ${BLUE}source ~/.zshrc${NC}"
echo "2. Restart Claude Code to see status line changes"
echo "3. Check new aliases: ${BLUE}alias | grep eza${NC}"
echo ""
