# TMUX Theme System — Contrast-Corrected

Graphite-based, eye-friendly theme system with consistent visual hierarchy.

## Design Principles

- **Neutral text layer** across most themes; `black` intentionally uses true `#000000`; `transparent` uses the terminal default background
- **Accent colors** reserved for borders/highlights only
- **Consistent contrast** hierarchy:
  - Primary text = readable
  - Strong text = current/highlight
  - Muted text = inactive/secondary
- **Dark/light parity** for every accent
- **Status bar style** defaults to inverse medium gray/dark text and can be changed independently

---

## Global Text Palette

### Dark Themes (ALL)
| Role | Color | Usage |
|------|-------|-------|
| Primary | `#b8bcc0` | Active pane, theme-native status |
| Strong | `#c6cacf` | Current window (bold) |
| Muted | `#8a8f94` | Inactive pane/window |

### Light Themes (ALL)
| Role | Color | Usage |
|------|-------|-------|
| Primary | `#3f4347` | Active pane, theme-native status |
| Strong | `#2f3336` | Current window (bold) |
| Muted | `#7a8086` | Inactive pane/window |

---

## Accent Colors

The revised blue/red/purple themes use visibly colored backgrounds with brighter active borders, while keeping familiar terminal/xterm color direction: blue, red, and magenta/purple.

| Theme | Accent | Best For |
|-------|--------|----------|
| `black` | `#000000` background, `#242424` active border | Total/true black terminal look with no colored accent |
| `transparent` | `default` background, `#6f767d` active border | Neutral terminal-transparent look |
| `graphite` | `#6f767d` (neutral) | **Default dark**, general use |
| `retrogreen` | `#33ff66` text on graphite, near-invisible borders | Old-school green terminal look |
| `cobalt` | `#5f87a8` | Alternative neutral |
| `green` | `#282c33` background, `#98c379` accent | Coding, development, AI |
| `green2` | `#004d27` background, white/light foregrounds | Green background modeled after `blue` |
| `blue` | `#0b2a5b` background, `#5c9cff` accent | Research, learning; visible blue |
| `purple` | `#32104d` background, `#d56bff` accent | Creative, writing; visible purple |
| `orange` | `#d7a65f` | Testing, debugging |
| `red` | `#4a1010` background, `#ff5c5c` accent | Production, urgent; visible red |
| `nord` | `#88c0d0` | Arctic, minimal |
| `everforest` | `#a7c080` | Nature-inspired |
| `gruvbox` | `#fabd2f` | Warm retro |

---

## Structural Rules

### Borders
| Theme Type | Normal Border | Active Border |
|------------|---------------|---------------|
| Dark | `#2a2a2a` – `#303030` | Accent OR `#6f767d` |
| Light | `#d2d6da` | Accent OR `#8a9096` |

### Messages
| Theme Type | Foreground | Background |
|------------|------------|------------|
| Dark | Strong (`#c6cacf`) | Lifted (`#222222`–`#282828`) |
| Light | Strong (`#2f3336`) | Subtle (`#e6e6e2`–`#f2dddd`) |

### Status Bar
- Default bar style = inverse: `bg=#9a9a9a,fg=#101010`
- Bar style is independent from the pane theme
- `ttheme <theme> theme` keeps the theme-native bar
- `ttheme <theme> transparent` uses `bg=default`
- `ttheme <theme> dark` uses a dark neutral bar

---

## Theme List

### Dark Themes (14)
```
black    transparent  graphite  retrogreen  cobalt  green  green2
blue     purple       orange    red       nord    everforest  gruvbox
```

### Light Themes (10)
```
paper    lcobalt   lgreen    lblue     lpurple
lorange  lred      lnord     leverforest  lgruvbox
```

---

## Auto-Theme Session Mapping

| Session Keywords | Theme |
|------------------|-------|
| `code`, `dev`, `coding`, `claude`, `qwen`, `ai` | green/code (`#282c33`) |
| `green2`, `brightgreen`, `bright-green` | green2 (`#004d27`) |
| `black`, `trueblack`, `totalblack` | black |
| `transparent`, `trans`, `clear` | transparent |
| `retrogreen`, `phosphor`, `terminal-green`, `crt` | retrogreen |
| `research`, `learn`, `study`, `doc`, `read` | blue |
| `creative`, `write`, `note`, `idea`, `brain` | purple |
| `test`, `debug`, `spec`, `check` | orange |
| `prod`, `urgent`, `live`, `deploy` | red |
| `nord` | nord |
| `forest`, `ever`, `nature` | everforest |
| `gruv`, `retro`, `warm` | gruvbox |
| `cobalt` | cobalt |
| `paper`, `light` | paper |
| `lcobalt` | lcobalt |
| `lgreen` | lgreen |
| `lblue` | lblue |
| `lpurple` | lpurple |
| `lorange` | lorange |
| `lred` | lred |
| `lnord` | lnord |
| `leverforest`, `lforest` | leverforest |
| `lgruv` | lgruvbox |

---

## Usage

```bash
# Apply to current session with default inverse bottom bar
ttheme <theme-name>

# Apply to current session with a specific bottom bar
ttheme <theme-name> <bar-style>

# Bar styles: inverse (default), theme, transparent, dark
# Examples:
ttheme transparent
ttheme graphite theme
ttheme blue inverse
ttheme transparent transparent

# Apply manually
~/.tmux/themes.sh <theme-name> [session-name] [bar-style]
```

---

## Color Roles Summary

| Element | Role | Color Source |
|---------|------|--------------|
| `status-style` | Bottom bar text/background | Bar style override, default inverse |
| `window-status-style` | Bottom bar inactive window | Bar style override, default inverse |
| `window-status-current-style` | Bottom bar active window | Bar style override, default inverse |
| `window-style` | Muted text | Global palette |
| `window-active-style` | Primary text | Global palette |
| `pane-border-style` | Low contrast | Structural |
| `pane-active-border-style` | Accent highlight | Theme accent |
| `message-style` | Strong + lifted | Structural |