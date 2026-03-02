#!/bin/bash
#
# claude-statusline-starship.sh
# Statusline command that mirrors Starship prompt configuration
#
# Format: model [usage%] username@hostname directory git_branch git_status python_venv
# Based on: ~/.config/starship.toml
#
# Requires: jq (for JSON parsing)

# Detect active theme
if grep -q "Style: Pure" "$HOME/.config/starship.toml" 2>/dev/null; then
  THEME="pure"
else
  THEME="classic"
fi

# Read JSON input from stdin
input=$(cat)

# Extract model display name (cyan, not in starship — kept as meta info)
model_display=$(echo "$input" | jq -r '.model.display_name // .model.id // "unknown"')

# Extract token usage percentage
token_percentage=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
if [ -n "$token_percentage" ]; then
  token_display=$(printf "[%.0f%%]" "$token_percentage")
  model_display="$model_display $token_display"
fi

# Extract current directory from JSON
dir=$(echo "$input" | jq -r '.workspace.current_dir')

# Username and hostname
user=$(whoami)
host=$(hostname -s)

# Directory (truncated to repo name when inside git)
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

# Git info
git_branch=""
git_dirty=""
if cd "$dir" 2>/dev/null && git rev-parse --git-dir >/dev/null 2>&1; then
  git_branch=$(git -c core.useBuiltinFSMonitor=false branch --show-current 2>/dev/null || echo "HEAD")
  git_dirty=$(git -c core.useBuiltinFSMonitor=false status --porcelain 2>/dev/null)
fi

# Python virtual environment
venv_name=""
if [ -n "$VIRTUAL_ENV" ]; then
  venv_name=$(basename "$VIRTUAL_ENV")
fi

# Build output
out=""

# Model: cyan (not in starship, kept as meta)
out+=$(printf '\033[36m%s\033[0m' "$model_display")

if [ "$THEME" = "pure" ]; then
  # ── Pure theme ──────────────────────────────────────────────────────────────
  # username: bold white (format: [$user@]($style))
  out+=$(printf ' \033[1;37m%s@\033[0m' "$user")
  # hostname: bold cyan
  out+=$(printf '\033[1;36m%s\033[0m' "$host")
  # directory: bold white
  out+=$(printf ' \033[1;37m%s\033[0m' "$display_dir")
  # git branch: bold color(242) — :branch directly after dir
  if [ -n "$git_branch" ]; then
    out+=$(printf '\033[1;38;5;242m:%s\033[0m' "$git_branch")
    # git status: bold green — * directly after branch
    if [ -n "$git_dirty" ]; then
      out+=$(printf '\033[1;32m*\033[0m')
    fi
  fi
  # python venv: #e0af68 amber — (venv_name)
  if [ -n "$venv_name" ]; then
    out+=$(printf ' \033[38;2;224;175;104m(%s)\033[0m' "$venv_name")
  fi

else
  # ── Classic theme ────────────────────────────────────────────────────────────
  # username: white (format: [$user]($style)@  — @ is outside the style)
  out+=$(printf ' \033[37m%s\033[0m@' "$user")
  # hostname: bold cyan
  out+=$(printf '\033[1;36m%s\033[0m' "$host")
  # directory: white
  out+=$(printf ' \033[37m%s\033[0m' "$display_dir")
  # git branch: cyan — format: [ $branch]($style)
  if [ -n "$git_branch" ]; then
    git_icon=$(printf '\uf09b')
    out+=$(printf ' \033[36m%s %s\033[0m' "$git_icon" "$git_branch")
    # git status: green — modified icon \uf040
    if [ -n "$git_dirty" ]; then
      mod_icon=$(printf '\uf040')
      out+=$(printf ' \033[32m%s\033[0m' "$mod_icon")
    fi
  fi
  # python venv: #e0af68 amber — (venv_name)
  if [ -n "$venv_name" ]; then
    py_icon=$(printf '\ue73c')
    out+=$(printf ' \033[38;2;224;175;104m%s (%s)\033[0m' "$py_icon" "$venv_name")
  fi

fi

printf '%s' "$out"
