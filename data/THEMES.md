# TMUX Theme System — Contrast-Corrected

Graphite-based, eye-friendly theme system with consistent visual hierarchy.

## Design Principles

- **Neutral text layer** across all themes (no pure white/black)
- **Accent colors** reserved for borders/highlights only
- **Consistent contrast** hierarchy:
  - Primary text = readable
  - Strong text = current/highlight
  - Muted text = inactive/secondary
- **Dark/light parity** for every accent

---

## Global Text Palette

### Dark Themes (ALL)
| Role | Color | Usage |
|------|-------|-------|
| Primary | `#b8bcc0` | Active pane, status |
| Strong | `#c6cacf` | Current window (bold) |
| Muted | `#8a8f94` | Inactive pane/window |

### Light Themes (ALL)
| Role | Color | Usage |
|------|-------|-------|
| Primary | `#3f4347` | Active pane, status |
| Strong | `#2f3336` | Current window (bold) |
| Muted | `#7a8086` | Inactive pane/window |

---

## Accent Colors

| Theme | Accent | Best For |
|-------|--------|----------|
| `graphite` | `#6f767d` (neutral) | **Default dark**, general use |
| `cobalt` | `#5f87a8` | Alternative neutral |
| `green` | `#282c33` background, `#98c379` accent | Coding, development, AI |
| `blue` | `#7aa2d2` | Research, learning |
| `purple` | `#b294d2` | Creative, writing |
| `orange` | `#d7a65f` | Testing, debugging |
| `red` | `#d38686` | Production, urgent |
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
- Background = theme background
- Foreground = primary text (or soft accent optionally)
- Current session name may use accent

---

## Theme List

### Dark Themes (10)
```
graphite  cobalt  green  blue  purple
orange    red     nord   everforest  gruvbox
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
# Apply to current session
ttheme <theme-name>

# Apply manually
~/.tmux/themes.sh <theme-name> [session-name]
```

---

## Color Roles Summary

| Element | Role | Color Source |
|---------|------|--------------|
| `status-style` | Primary text | Global palette |
| `window-status-style` | Muted text | Global palette |
| `window-status-current-style` | Strong text (bold) | Global palette |
| `window-style` | Muted text | Global palette |
| `window-active-style` | Primary text | Global palette |
| `pane-border-style` | Low contrast | Structural |
| `pane-active-border-style` | Accent highlight | Theme accent |
| `message-style` | Strong + lifted | Structural |