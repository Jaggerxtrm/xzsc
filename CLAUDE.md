# CLAUDE.md — AI Assistant Context

This file provides context for AI coding assistants (Claude Code, etc.) working on this repository.

## Project purpose

A portable, one-command installer for a modern Zsh + Starship + tmux environment.
Target users: developers setting up a new Linux machine (Fedora, RHEL, Ubuntu, Debian) or WSL2.

Distributed as an npm package installed from GitHub:
```bash
npm install -g github:Jaggerxtrm/zsh-starship-config
zsc install
```

## Key files

| File | Role |
|---|---|
| `install.sh` | Main bash installer (~1400 lines). All install logic lives here as named functions. |
| `bin/cli.js` | Node.js CLI entry point. Routes `zsc` subcommands to `install.sh` flags or bash scripts. Zero npm deps. |
| `package.json` | npm package definition. Two bin entries: `zsh-starship-config` and `zsc`. |
| `data/tmux.conf` | tmux configuration deployed to `~/.tmux.conf`. Contains `ZSHELL_PATH` placeholder replaced at install time. |
| `data/themes.sh` | Bash library: `apply_theme <theme> <session>`. Deployed to `~/.tmux/themes.sh`. |
| `data/apply-theme-hook.sh` | Runs on `after-new-session` hook; auto-selects theme from session name. |
| `starship.toml` | Neutral Starship prompt config (no hardcoded colors, adaptive to any tmux theme). |
| `starship-pure.toml` | Minimal Pure-style alternative. |
| `data/claude-statusline-starship.sh` | Claude Code statusline script (model, token %, git, venv). |

## Architecture decisions

### install.sh is a monolith by design
All install functions (`install_eza`, `install_tmux`, `configure_zshrc`, etc.) live in one file.
This simplifies npx/npm distribution — no multi-file sourcing required.
The `--only <component>` flag routes to individual functions without splitting the file.

### cli.js dispatches to bash, not the other way
Node is only used for CLI UX (arg parsing, validation, error messages).
All real work happens in bash. `runInstallScript(args)` is the primary dispatch mechanism.

### tmux.conf uses a placeholder for zsh path
`data/tmux.conf` contains `set -g default-shell ZSHELL_PATH`.
`patch_tmux_conf()` in `install.sh` substitutes the real zsh binary path via `sed` after copying.
Never hardcode `/bin/zsh` — path varies between distros (`/usr/bin/zsh` on Debian/Ubuntu).

### Theming is session-scoped, not global
`apply_theme()` in `themes.sh` uses `tmux set-option -t "$session"` (no `-g`).
This allows per-session themes. The dual status bar (`set -g status 2`) is global.

## install.sh function map

```
main()
├── detect_os()                   — sets $OS variable
├── install_base_packages()
├── install_oh_my_zsh()
├── install_zsh_plugins()
├── install_starship()
├── install_nerd_fonts()
├── handle_wsl_fonts()
├── install_eza()
│   └── update_eza_from_github()
├── install_jq()
├── install_tmux()
│   └── patch_tmux_conf()        — substitutes ZSHELL_PATH placeholder
├── apply_starship_config()
├── install_claude_code_statusline()
├── install_modern_tools()
├── configure_zshrc()
│   ├── create_new_zshrc()
│   ├── merge_zshrc_config()
│   └── add_starship_to_existing_zshrc()
├── change_shell_to_zsh()
└── verify_installation()        — also called standalone via --status
```

## zsc CLI commands → bash mapping

| `zsc` command | bash invocation |
|---|---|
| `zsc install` | `install.sh` |
| `zsc update` | `install.sh --update` |
| `zsc update eza` | `install.sh --update --only eza` |
| `zsc status` | `install.sh --status` |
| `zsc theme nord` | `bash ~/.tmux/themes.sh nord <session>` |

## Tmux themes

9 themes: `cobalt` (default), `green`, `blue`, `purple`, `orange`, `red`, `nord`, `everforest`, `gruvbox`.

Auto-theme logic in `apply-theme-hook.sh`:
- Session name `*dev*`, `*code*`, `*claude*` → green
- `*research*`, `*doc*` → blue
- `*test*`, `*debug*` → orange
- `*prod*`, `*urgent*` → red

## Constraints & gotchas

- `set -e` is active in `install.sh`. Any failing command aborts the script. Guard with `|| true` where failure is acceptable.
- `detect_os()` must be called before any install function that uses `$OS`.
- `data/tmux.conf` must NOT have a hardcoded zsh path — always use `ZSHELL_PATH` placeholder.
- `run '~/.tmux/plugins/tpm/tpm'` must remain the last TPM line; `set -g status 2` and `status-format[1]` come after it intentionally.
- Dual status bar (`set -g status 2`) requires tmux ≥ 3.0. Older versions silently ignore it.
- `zsc theme` resolves session automatically: explicit arg → `$TMUX` env → `tmux ls` first result.

## Testing on a fresh machine

```bash
# Smoke test without running install
node bin/cli.js help
node bin/cli.js update badcomponent   # should error with valid list
node bin/cli.js theme badtheme        # should error with valid list

# Dry-run status check
bash install.sh --status
```
