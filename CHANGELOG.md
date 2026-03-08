# Changelog

## v3.0.0 - 2026-03-08

### Tmux Integration
- **Add tmux + TPM + plugins** to installer: tmux-sensible, tmux-yank, tmux-resurrect, tmux-continuum
- **9 color themes** added to repo (`data/themes.sh`): cobalt, green, blue, purple, orange, red, nord, everforest, gruvbox
- **Auto-theme hook** (`data/apply-theme-hook.sh`): applies theme automatically based on session name
- **`ttheme <name>`** function and tmux aliases (`ta`, `tl`, `tn`, `tk`, `tw`, `tsp`, `tsh`) added to `.zshrc` template
- **`th`** function: shows tmux keybind and theme reference inline

### Bug Fixes
- **`_setw` in themes.sh**: now iterates ALL windows in the session via `list-windows` (previously only applied to current window)
- **`refresh-client`** added after theme apply — changes are visible immediately without reattaching
- **TPM plugin install**: replaced `tpm/bin/install_plugins` (requires live tmux server) with direct `git clone` — works on fresh VPS without any active session
- **Starship theme menu removed**: was showing outdated Classic/Pure options; always applies `starship.toml` directly with auto-backup
- **Double space in prompt**: removed fixed space before `$character` in format string; trailing spaces moved inside git module formats so they only appear when content is present

### Installation Method
- **Switch to GitHub npm install**: `npm install -g github:Jaggerxtrm/zsh-starship-config`
- `npx zsh-starship-config` no longer works (package not on npmjs registry)
- **Update**: re-run the install command (same as fresh install)

### Neutral Starship Theme
- Updated `starship.toml`: neutral/adaptive, no hardcoded colors, no Nerd Font required
- `zsh-syntax-highlighting` styles updated to neutral (bold/underline only, no vivid colors)
- `ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE` and history search highlight updated to neutral grey

---

## v2.1.5 - 2026-03-02

### 🐛 Bug Fixes

- **installer**: add `fontconfig` to base packages — fixes silent crash after font download (`fc-cache: command not found` with `set -e`)
- **installer**: fix theme selection prompt never appearing — `choose_starship_theme` was called in a subshell (`$()`), now sets global directly and reads from `/dev/tty`
- **installer**: install `zoxide` on Debian/Ubuntu via `apt` (was silently skipped with a warning)
- **installer**: fix zsh plugin insertion into single-line `plugins=(git)` arrays — plugins were appended outside the parentheses
- **statusline**: theme-aware colors now match both `starship.toml` and `starship-pure.toml` exactly (bold cyan host, cyan branch for Classic; bold white user/dir, bold grey-242 branch, bold green status for Pure)
- **statusline**: Pure theme git branch now attaches directly to directory with no space (`:branch*`)

## v2.2.0 - 2026-02-26

### 🎨 New: Pure Theme + npx Installer + Bug Fixes

#### Pure Starship Theme (`starship-pure.toml`)
- **New minimal theme** inspired by [sindresorhus/pure](https://github.com/sindresorhus/pure)
- Git status uses Unicode symbols: `*` (dirty), `⇡` (ahead), `⇣` (behind), `⇡⇣` (diverged), `≡` (stash)
- Git state indicator for in-progress operations: `rebase`, `merge`, `cherry-pick`, etc.
- Branch name in muted gray (`color(242)`), no icon required
- `user@host` moved to right prompt — keeps left side minimal, info always visible
- Bold styles throughout; works with any monospace font (no Nerd Font required)
- `*` attaches directly to branch name (no space), space always present in clean repos

#### npx Installer
- **Run without cloning**: `npx -y github:Jaggerxtrm/zsh-starship-config`
- Added `package.json` and `bin/cli.js` entry point
- Theme selection prompt shown at install time with ASCII previews of both themes

#### Theme Selection at Install Time
- Interactive menu with side-by-side ASCII preview of Classic vs Pure themes
- Skipped in `--update` mode to avoid disrupting existing config
- All UI output correctly redirected to stderr so path capture via `$()` works correctly

#### Bug Fixes
- **`.zshrc` block multiplication**: `EZA_SECTION_EXISTS` guard was checking `# Alias eza` but
  `create_new_zshrc()` writes `# Alias moderni` — mismatch caused full eza block to be appended
  on every installer run. Fixed to use `alias ls=.*eza` pattern which matches both styles.
- **Unnecessary backup on merge**: Backup was created unconditionally even when only merging
  missing config (no overwrite). Now removed if no overwrite happens.
- **Zoxide init placement**: Moved `eval "$(zoxide init zsh)"` to end of `.zshrc` in both
  `create_new_zshrc()` template and `merge_zshrc_config()` check (zoxide requires this).
- **Missing zoxide check in merge**: `merge_zshrc_config()` now detects and appends zoxide
  init if absent, with a warning if found but not at end of file.
- **Duplicate heredoc block**: Removed orphaned `export DISABLE_* / EOF / }` lines left after
  `create_new_zshrc()` — would have caused a syntax error at runtime.
- **`choose_starship_theme()` stdout pollution**: All `echo` statements redirected to stderr;
  only the final file path goes to stdout so `CHOSEN_CONFIG=$(...)` captures correctly.
- **`starship-pure.toml` missing from npm `files`**: Added to `package.json` files array so
  npx includes it in the fetched package.
- **`package.json` JSON syntax error**: Unescaped inner quotes in test script caused
  `EJSONPARSE` on every `npx` invocation.

---

## v2.1.4 - 2026-02-02

### ⚙️ Environment & Alias Fixes

- **PATH Priority Fix**: Moved `PATH` and environment variable exports to the top of the `.zshrc` template. This ensures that local binaries (like `eza`, `starship`, `zoxide`) are available in the search path before the script checks for their existence to define aliases.
- **Improved Merge Logic**: The installer now intelligently inserts the `~/.local/bin` path at the beginning of existing `.zshrc` files if missing, rather than appending it to the end.
- **Fixed "lt" command missing**: Resolved an issue where `lt` and other `eza`-based aliases were not being defined because `eza` was not yet in the `PATH` during shell initialization.

---

## v2.1.3 - 2026-02-02

### 📊 Claude Code Schema Fix

- **Missing "type" field**: Added the required `"type": "command"` field to the `statusLine` configuration in `settings.json`. Recent versions of Claude Code require this field to be explicitly defined for the statusline to be valid.

---

## v2.1.2 - 2026-02-02

### 📊 Claude Code Integration Fix

- **Absolute Path for Statusline**: Updated `install.sh` to use the absolute path for the Claude Code statusline command in `settings.json`. This fixes issues where the tilde (`~`) expansion was not being handled correctly by Claude Code, causing the statusline to fail to load.

---

## v2.1.1 - 2026-02-02

### 🛡️ Script Robustness & Bug Fixes

This release focuses on preventing potential terminal crashes and improving the reliability of the update mechanism.

### ✨ Improvements

#### 1. Terminal Crash Prevention
- **Anti-Sourcing Guard**: Added checks to `update.sh` and `install.sh` to prevent them from being sourced (`source ./update.sh`). Sourcing scripts with `exit` commands could previously cause the terminal session to close abruptly, which users perceived as a crash.
- **Improved WSL Interop**: Added guards for `powershell.exe` and `cmd.exe` calls in WSL environments. The scripts now gracefully handle cases where Windows Interop is disabled or restricted, preventing script termination.

#### 2. Better Visual Feedback
- **Color Rendering Fix**: Updated `update.sh` to use literal ESC characters for color variables, ensuring consistent rendering across different terminal emulators and shells.
- **Smart Update Logic**: Refined the detection of missing features in `.zshrc` to be more precise and informative.

#### 3. Maintenance
- **Updated Documentation**: Added warnings about not sourcing the scripts in the README.md and UPGRADE.md.

---

## v2.1.0 - 2026-02-02

### 🚀 Major Update: Comprehensive Update Mechanism & Version Tracking

This release implements a robust update system that ensures existing users receive new features and fixes automatically.

### ✨ New Features

#### 1. Version Tracking System
- **`.config-version`**: Tracks individual component versions (starship.toml v2.1.0, .zshrc template v2.1.0)
- **Version history**: Maintains changelog of configuration changes
- **Installed version tracking**: Stores version in `~/.zsh-starship-config-version`
- **Version comparison**: Smart update decisions based on version differences

#### 2. Smart Diff-Based Updates (install.sh)
- **Intelligent starship.toml updates**:
  - ✅ Uses `diff` to check for actual changes (no blind overwriting)
  - ✅ Creates automatic timestamped backups before updating
  - ✅ Asks user confirmation in normal mode
  - ✅ Auto-updates in `--update` mode
  - ✅ Tracks update status (updated/skipped/unchanged)

- **Enhanced .zshrc merge**:
  - ✅ Checks **each** alias individually (not just "any eza alias")
  - ✅ Detects missing features: lsga, lsg3, lsgm, Bun config, dotfiles alias, Claude Code env vars
  - ✅ Adds only missing features (no duplication)
  - ✅ Preserves user customizations

- **Update summary report**:
  - Shows what was updated/skipped/unchanged
  - Lists new features added to .zshrc
  - Displayed in both update and normal modes

#### 3. Dedicated update.sh Script (Completely Rewritten)
- **Git repository check**: Fetches updates and shows recent commits
- **Pre-update configuration check**: Lists exactly what's missing before updating
- **Version comparison**: Shows installed vs available versions
- **Feature detection**: Lists missing .zshrc features (lsga, lsg3, lsgm, Bun, dotfiles, Claude vars)
- **Colored output**: Better UX with green/yellow/red/blue indicators
- **Confirmation prompts**: User control before making changes
- **Post-update instructions**: Clear next steps after update

### 🐛 Bug Fixes (GitHub Issue #1)

#### Directory Handling in install.sh
- **Root cause**: `install_nerd_fonts()` changed to `/tmp` but never returned
- **Fix**: Added `SCRIPT_DIR` global variable and directory restoration
- **Impact**: Script now works from any working directory

**Changes:**
- Added `SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"` global variable (line 10)
- Added directory restoration in `install_nerd_fonts()` (lines 165, 237)
- Added directory restoration in `update_eza_from_github()` (lines 362, 378)
- Changed to absolute path: `$SCRIPT_DIR/starship.toml` (line 507)

### 📊 System Customizations Synced (System → Repository)

#### New .zshrc Template Features
- **Custom eza aliases**:
  - `lsga`: Tree view with git status
  - `lsg3`: 3-level tree with git status
  - `lsgm`: Git status short format (`git status -s`)

- **Runtime configurations**:
  - Bun completions and PATH setup
  - Dotfiles bare git repository alias (`config` command)
  - Claude Code telemetry disabling environment variables

### 📝 Documentation Updates

- **Prompt symbol**: Updated `⮕` → `>` in EXAMPLES.md, QUICK_START.md, README.md
- **Matches configuration**: `success_symbol = "[>](bold green)"`, `error_symbol = "[>](bold red)"`

### 🔧 Technical Details

**Update Tracking Variables**:
```bash
STARSHIP_UPDATED/SKIPPED/UNCHANGED
ZSHRC_UPDATED/SKIPPED/UNCHANGED
```

**New Functions**:
- `show_update_summary()`: Displays update report
- Enhanced `merge_zshrc_config()`: Specific feature detection
- Improved `apply_starship_config()`: Diff-based updates

### 📦 Files Changed

**New Files:**
- `.config-version` - Component version tracking
- Enhanced `update.sh` (+177 lines) - Complete rewrite

**Updated Files:**
- `VERSION` - 1.7.0 → 2.1.0
- `install.sh` (+175 lines) - Smart diff updates + summary
- `EXAMPLES.md`, `QUICK_START.md`, `README.md` - Prompt symbol updates

### 🎯 Impact on Existing Users

**Before v2.1.0:**
- ❌ starship.toml: Always overwritten (no backup, no choice)
- ❌ New aliases: Ignored (only checked "any eza alias")
- ❌ New features: Never propagated to existing users
- ❌ No version tracking

**After v2.1.0:**
- ✅ starship.toml: Diff-based update with backups
- ✅ Each feature checked individually
- ✅ New features automatically added
- ✅ Version tracking enables smart decisions

### 💡 Usage

**For existing users:**
```bash
./update.sh              # Smart update with version check (recommended)
# OR
./install.sh --update    # Direct update mode
```

**Check version:**
```bash
cat ~/.zsh-starship-config-version  # Shows: 2.1.0
```

### 🔗 References
- Fixes #1 (GitHub Issue)
- Related commits: 88a0496, df4e699

---

## v2.0.0 - 2026-02-01

### 🎉 Major Release: Update System & Smart Configuration

Questa è una major release che risolve i problemi di aggiornamento e introduce un sistema intelligente di gestione configurazioni.

### 🔄 Nuove Funzionalità

#### Sistema di Update
- **Flag `--update`**: Modalità update dedicata per aggiornare installazioni esistenti
- **Verifica versioni**: Controlla versioni Starship, eza prima di reinstallare
- **Update interattivo**: Chiede conferma prima di aggiornare ogni componente
- **Script wrapper `update.sh`**: Shortcut per `./install.sh --update` + `git pull`
- **Flag `--verbose`**: Output dettagliato per debugging

#### Merge Intelligente .zshrc
- **NON sovrascrive più** le personalizzazioni utente!
- **Merge automatico**: Aggiunge solo elementi mancanti (plugin, alias, Starship)
- **Backup automatico**: Crea `~/.zshrc.backup.TIMESTAMP` ad ogni modifica
- **Rilevamento configurazione**: Controlla se Starship è già configurato
- **Prompt intelligente**: Chiede cosa fare in caso di conflitto

#### Installazione Automatica Font Windows (WSL)
- **PowerShell automation**: Installa font su Windows automaticamente da WSL
- **User-level install**: Non richiede privilegi amministratore
- **Registry integration**: Registra font in Windows Registry
- **Fallback manuale**: Se PowerShell fallisce, istruzioni manuali chiare
- **Update-aware**: Non ricopia font se già presenti (in modalità normale)

#### Verifica Post-Installazione
- **Auto-check**: Verifica automatica di tutti i componenti installati
- **Report dettagliato**: Mostra versioni installate e componenti mancanti
- **Contatore errori/warning**: Distingue errori critici da avvisi
- **Test rendering**: (con `--verbose`) Verifica che Starship funzioni

#### Ordine di Installazione Corretto
- **FIX CRITICO**: `apply_starship_config()` ora eseguito PRIMA di `install_claude_code_statusline()`
- Garantisce che Claude Code statusline abbia accesso alla configurazione Starship

### 📝 File Nuovi/Modificati

#### Nuovi File
- `scripts/install-fonts-windows.ps1` - Script PowerShell per installazione automatica font
- `UPGRADE.md` - Guida completa all'aggiornamento
- `update.sh` - Script wrapper per update rapido

#### File Modificati
- `install.sh` - Completamente rivisitato con nuove funzionalità
- `README.md` - Sezioni update, WSL e opzioni CLI
- `CHANGELOG.md` - Questo file

### 🔧 Miglioramenti Funzioni

#### `install_starship()`
- Rileva versione corrente
- Confronta versioni prima/dopo update
- Prompt interattivo per aggiornamento
- Supporto `--update` mode

#### `install_eza()`
- Update da package manager (se installato così)
- Update da GitHub releases (fallback)
- Helper function `update_eza_from_github()`
- Verifica versione installata

#### `handle_wsl_fonts()`
- Integrazione script PowerShell
- Conversione path WSL → Windows (`wslpath`)
- Pulizia directory in UPDATE_MODE
- Fallback manuale se PowerShell fallisce

#### `configure_zshrc()`
- **Breaking change**: Non sovrascrive più automaticamente
- Nuove funzioni helper:
  - `create_new_zshrc()` - Crea .zshrc da zero
  - `merge_zshrc_config()` - Merge elementi mancanti
  - `add_starship_to_existing_zshrc()` - Aggiunge solo Starship
- Backup automatico con timestamp
- Rilevamento configurazione esistente

#### `verify_installation()`
- **Nuova funzione**: Verifica completa post-installazione
- Check componenti: Zsh, Starship, eza, jq, font, Claude statusline
- Report formattato con ✓ ⚠️ ❌
- Return code 1 se errori critici

### 🎯 Edge Cases Risolti

1. **Starship già installato**: Non reinstalla, propone update
2. **eza già installato**: Verifica package manager vs GitHub install
3. **Font WSL duplicati**: Non ricopia se già presenti
4. **`.zshrc` personalizzato**: Merge invece di overwrite
5. **Configurazione Starship mancante**: Rilevata e corretta
6. **Claude statusline prima di starship.toml**: Ordine corretto

### 🪟 WSL: Dettagli Tecnici

#### Font Installation Flow
```bash
1. Copia font → /mnt/c/Users/$WIN_USER/Downloads/NerdFonts_Zsh_Setup
2. Genera script PowerShell → /tmp/install-fonts.ps1
3. Converti path → wslpath -w
4. Esegui PowerShell → powershell.exe -ExecutionPolicy Bypass
5. Installa font → $env:LOCALAPPDATA\Microsoft\Windows\Fonts
6. Registra → HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts
```

#### Registry Key Format
```powershell
Name: "FontBaseName (TrueType)"  # o (OpenType)
Value: "FontFileName.ttf"
```

### 📖 Documentazione

- **UPGRADE.md**: Guida completa 2000+ parole con:
  - Comparazione Before/After
  - Troubleshooting dedicato
  - Best practices
  - Esempi pratici
- **README.md**: Sezioni aggiornate per update e WSL
- **Help integrato**: `./install.sh --help`

### ⚠️ Breaking Changes

1. **Comportamento .zshrc**: Non sovrascrive più automaticamente
   - **Migrazione**: Se vuoi il vecchio comportamento, usa `--update` e conferma overwrite
2. **Ordine esecuzione**: `apply_starship_config` spostato prima di Claude statusline
   - **Impatto**: Nessuno per utenti finali, fix interno

### 🔄 Upgrade Path

Da v1.x a v2.0:
```bash
cd ~/projects/zsh-starship-config
git pull
./install.sh --update
```

Risultato:
- ✅ Starship aggiornato
- ✅ .zshrc preservato (merge solo elementi mancanti)
- ✅ Font Windows auto-installati (se WSL)
- ✅ Verifica automatica componenti

### 🐛 Bug Fixes

- **FIX**: Starship config applicato dopo Claude statusline (ora prima)
- **FIX**: Font WSL copiati ad ogni run (ora solo se necessario)
- **FIX**: .zshrc sovrascritto senza chiedere (ora merge intelligente)
- **FIX**: Nessuna verifica post-install (ora automatica)
- **FIX**: Versioni componenti non verificate (ora controllate)

### 📊 Statistiche

- **Linee di codice**: ~870 (era ~506, +72%)
- **Nuove funzioni**: 7 (`merge_zshrc_config`, `add_starship_to_existing_zshrc`, `create_new_zshrc`, `verify_installation`, `update_eza_from_github`, `show_help`, PowerShell script)
- **Nuovi file**: 3 (UPGRADE.md, update.sh, install-fonts-windows.ps1)
- **Flag CLI**: 3 (--update, --verbose, --help)

### 🙏 Grazie

Questa release è stata sviluppata per risolvere problemi reali di utenti che aggiornavano da versioni precedenti.

## v1.7.0 - 2026-01-31

### Nuove Funzionalità
- 🪟 **Supporto WSL2 Smart**: Rileva automaticamente l'ambiente WSL.
- 📤 **Auto-Export Font per Windows**: Copia i font scaricati nella cartella `Downloads/NerdFonts_Zsh_Setup` di Windows per facilitare l'installazione manuale sull'host.

## v1.6.0 - 2026-01-31

### Nuove Funzionalità
- 🔤 **Extended Nerd Fonts Support**: L'installer ora scarica e installa automaticamente anche:
  - **Hack Nerd Font**
  - **FiraMono Nerd Font**
  - **Cousine Nerd Font**
- 🛠️ **Installazione più robusta**: Migliorata la gestione dei download dei font.

## v1.5.0 - 2026-01-31

### Cambiamenti
- 🎨 **Nuovo Tema Verde**: Aggiornata la palette colori per maggiore coerenza con Hostname e Git.
- 🟢 **Prompt Character**: Il simbolo `>` ora è **verde grassetto** (successo) e **rosso grassetto** (errore).
- 🌈 **Syntax Highlighting Rivisitato**:
  - **Comandi**: Verde standard (pulito, no bold).
  - **Path**: Bianco (rimosso underline per leggibilità).
  - **Alias**: Verde acqua (teal) per distinzione.
  - **Pre-comandi**: Ciano grassetto per dare enfasi a `sudo` etc.
  - **Stringhe**: Giallo Tokyo Night (coerente con altri elementi).
  - **Globbing/Redirection**: Viola soft per contrasto.

## v1.4.0 - 2025-01-31

### Nuove Funzionalità
- 🤖 **Claude Code Status Line Enhanced**: Versione avanzata con funzionalità real-time
  - 📊 **Token Usage**: Mostra percentuale contesto utilizzato `[X%]`
  - 🔄 **Auto-update**: Si aggiorna dinamicamente dopo compaction
  - 🤖 **Model Display**: Mostra il modello Claude in uso (cyan)
  - 🎨 **Color-coded**: Colori Starship-matched per coerenza visiva
- 📁 **Smart Directory Truncation**: Path truncato a repository root (come Starship)
- 🔧 **Installer Migliorato**: Preserva configurazioni esistenti in settings.json

### File Aggiunti
- `data/claude-statusline-starship.sh` - Script statusline enhanced nel repository
- Configurazione automatica in `~/.claude/hooks/statusline-starship.sh`

### Documentazione
- Sezione "Integrazione Claude Code Status Line" completamente riscritta
- Nuova tabella con tutte le feature della statusline
- Esempi di output e caratteristiche avanzate documentate

### Breaking Changes
- Path statusline cambiato da `~/.claude/statusline-command.sh` a `~/.claude/hooks/statusline-starship.sh`
- L'installer fa backup automatico di configurazioni esistenti

## v1.3.0 - 2024-12-30

### Nuove Funzionalità
- 🔗 **Integrazione Claude Code Status Line**: Script dedicato per usare lo stesso tema Starship in Claude Code
- 📜 Nuovo file `.claude-statusline.sh` per status line personalizzata
- 🎨 Status line con icone e colori coerenti col tema Tokyo Night

### Documentazione
- Nuova sezione "Integrazione Claude Code Status Line" nel README
- Istruzioni per configurazione automatica

## v1.2.0 - 2024-12-28

### Nuove Funzionalità
- 📁 **Installazione automatica eza** da GitHub releases
- 🌳 **Tree intelligente**: `lt` esclude venv, node_modules, .git
- 📋 Nuovo alias `lta` per tree completo
- 🔧 Script install.sh migliorato con fallback per eza

### Miglioramenti
- Icona untracked cambiata a `\uf059` (? cerchiato più compatto)
- Documentazione aggiornata con nuovi alias

## v1.1.0 - 2024-12-28

### Cambiamenti
- 🎨 Cambiato tema da Tokyo Night a **Ocean Blue + Tokyo Night ibrido**
- ⮕ Nuovo prompt character: freccia moderna `⮕` invece di `❯`
- 🌊 Syntax highlighting con palette **Ocean Blue**:
  - Comandi validi: blu chiaro (#61afef)
  - Comandi non validi: rosso soft (#e06c75)
  - Built-in: cyan (#56b6c2)
  - Alias: blu elettrico (#528bff)
  - Path: azzurro (#89b4fa) con underline
  - Stringhe: cyan brillante (#7dcfff)
- 🐧 Icona Linux cambiata da Fedora a Tux generico
- 📝 Documentazione aggiornata con nuovi colori

### Configurazione
- Starship prompt character colors match Ocean Blue theme
- zsh-syntax-highlighting configurato con Ocean Blue palette
- Tutti gli esempi aggiornati con nuovo prompt character

## v1.0.0 - 2024-12-28

### Rilascio Iniziale
- ✨ Setup completo Zsh + Starship
- 📦 Script di installazione automatica
- 📖 Documentazione completa in italiano
- 🔤 Supporto Nerd Fonts (MesloLGS NF, JetBrainsMono)
- 🎨 Tema Tokyo Night
- 🐍 Supporto Python + venv
- 📊 Git status dettagliato con icone
