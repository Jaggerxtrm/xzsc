#!/usr/bin/env bash
# ============================================
# TMUX COLOR THEMES
# Contrast-Corrected, Graphite-Based
# ============================================

apply_theme() {
    local theme="$1"
    local session="$2"
    local bar_style="${3:-theme}"
    local pane_bg

    # session options (status bar)
    _set()  { tmux set-option -t "$session" "$@"; }

    # window options — applied at session level + all existing windows
    _setw() {
        # Session-level default (for new windows)
        tmux set-option -t "$session" -w "$@" 2>/dev/null || true
        # Apply immediately to all existing windows
        tmux list-windows -t "$session" -F '#{window_index}' 2>/dev/null | \
        while read -r idx; do
            tmux set-option -t "${session}:${idx}" -w "$@" 2>/dev/null || true
        done
    }

    _validate_bar_style() {
        case "$1" in
            inverse|light|lightgray|lightgrey|bar-light|theme|native|none|transparent|clear|dark)
                return 0
                ;;
            *)
                echo "Unknown bar style: $1"
                echo "Bar styles: theme (default), transparent, dark, inverse"
                return 1
                ;;
        esac
    }

    _apply_bar_style() {
        case "$1" in
            inverse|light|lightgray|lightgrey|bar-light)
                _set  status-style                'fg=#000000,bg=#ffffff'
                _set  window-status-style         'fg=#000000,bg=#ffffff'
                _set  window-status-current-style 'fg=#000000,bg=#ffffff,bold'
                ;;
            theme|native|none)
                ;;
            transparent|clear)
                _set  status-style                'fg=#b8bcc0,bg=default'
                _set  window-status-style         'fg=#8a8f94,bg=default'
                _set  window-status-current-style 'fg=#c6cacf,bg=default,bold'
                _set  message-style               'fg=#c6cacf,bg=default'
                ;;
            dark)
                _set  status-style                'fg=#d0d0d0,bg=#202020'
                _set  window-status-style         'fg=#a8a8a8,bg=#202020'
                _set  window-status-current-style 'fg=#f0f0f0,bg=#202020,bold'
                ;;
        esac
    }

    _validate_bar_style "$bar_style" || return 1

    # ============================================
    # GLOBAL TEXT PALETTE
    # ============================================
    # Dark themes: primary=#b8bcc0, strong=#c6cacf, muted=#8a8f94
    # Light themes: primary=#3f4347, strong=#2f3336, muted=#7a8086
    # Accents reserved for borders/highlights only

    case "$theme" in
        # ============================================
        # DARK THEMES
        # ============================================

        # --- BLACK / TOTAL BLACK (True terminal black) ---
        black|totalblack|total-black|trueblack|true-black)
            # Background: #000000; neutral border, no accent color
            _set  status-style               'fg=#e6e6e6,bg=#000000'
            _set  window-status-style        'fg=#a8a8a8,bg=#000000'
            _set  window-status-current-style 'fg=#f0f0f0,bg=#000000,bold'
            _setw window-style               'fg=#a8a8a8,bg=#000000'
            _setw window-active-style        'fg=#e6e6e6,bg=#000000'
            _setw pane-border-style          'fg=#202020,bg=#000000'
            _setw pane-active-border-style   'fg=#242424,bg=#000000'
            _set  message-style              'fg=#f0f0f0,bg=#101010'
            ;;

        # --- TRANSPARENT / NEUTRAL (Terminal background) ---
        transparent|trans|clear|neutral-transparent|neutralclear)
            # Background: terminal default; keeps terminal transparency visible
            _set  status-style                'fg=#b8bcc0,bg=default'
            _set  window-status-style         'fg=#8a8f94,bg=default'
            _set  window-status-current-style 'fg=#c6cacf,bg=default,bold'
            _setw window-style                'fg=#8a8f94,bg=default'
            _setw window-active-style         'fg=#b8bcc0,bg=default'
            _setw pane-border-style           'fg=#303030,bg=default'
            _setw pane-active-border-style    'fg=#6f767d,bg=default'
            _set  message-style               'fg=#c6cacf,bg=default'
            ;;

        # --- GRAPHITE (DEFAULT DARK - Neutral Accent) ---
        graphite|default|dark|"")
            # Background: #181818
            _set  status-style               'fg=#b8bcc0,bg=#181818'
            _set  window-status-style        'fg=#8a8f94,bg=#181818'
            _set  window-status-current-style 'fg=#c6cacf,bg=#181818,bold'
            _setw window-style               'fg=#8a8f94,bg=#181818'
            _setw window-active-style        'fg=#b8bcc0,bg=#181818'
            _setw pane-border-style          'fg=#303030,bg=#181818'
            _setw pane-active-border-style   'fg=#6f767d,bg=#242424'
            _set  message-style              'fg=#c6cacf,bg=#222222'
            ;;

        # --- RETROGREEN (Old-school green terminal on graphite) ---
        retrogreen|phosphor|retro-green|crt|terminal-green)
            # Background: #141414; primary phosphor green: #33ff66
            _set  status-style               'fg=#33ff66,bg=#141414'
            _set  window-status-style        'fg=#00b84a,bg=#141414'
            _set  window-status-current-style 'fg=#99ffad,bg=#141414,bold'
            _setw window-style               'fg=#00b84a,bg=#141414'
            _setw window-active-style        'fg=#33ff66,bg=#141414'
            _setw pane-border-style          'fg=#181818,bg=#141414'
            _setw pane-active-border-style   'fg=#202820,bg=#141414'
            _set  message-style              'fg=#99ffad,bg=#1a1a1a'
            ;;

        # --- COBALT (Accent: #5f87a8) ---
        cobalt)
            # Background: #1b2128
            _set  status-style               'fg=#b8bcc0,bg=#1b2128'
            _set  window-status-style        'fg=#8a8f94,bg=#1b2128'
            _set  window-status-current-style 'fg=#c6cacf,bg=#1b2128,bold'
            _setw window-style               'fg=#8a8f94,bg=#1b2128'
            _setw window-active-style        'fg=#b8bcc0,bg=#1b2128'
            _setw pane-border-style          'fg=#2a2a2a,bg=#1b2128'
            _setw pane-active-border-style   'fg=#5f87a8,bg=#1b2128'
            _set  message-style              'fg=#c6cacf,bg=#242424'
            ;;

        # --- GREEN / CODE (Dev/Coding - Background: #282c33) ---
        green|dev|coding|code)
            # Background: #282c33
            _set  status-style               'fg=#b8bcc0,bg=#282c33'
            _set  window-status-style        'fg=#8a8f94,bg=#282c33'
            _set  window-status-current-style 'fg=#c6cacf,bg=#282c33,bold'
            _setw window-style               'fg=#8a8f94,bg=#282c33'
            _setw window-active-style        'fg=#b8bcc0,bg=#282c33'
            _setw pane-border-style          'fg=#2a2a2a,bg=#282c33'
            _setw pane-active-border-style   'fg=#98c379,bg=#282c33'
            _set  message-style              'fg=#c6cacf,bg=#222222'
            ;;

        # --- BLUE (Research/Learning - visible terminal blue) ---
        blue|research|learning)
            # Background: visible blue tint; brighter active border
            _set  status-style               'fg=#dbeafe,bg=#0b2a5b'
            _set  window-status-style        'fg=#9bb6d8,bg=#0b2a5b'
            _set  window-status-current-style 'fg=#ffffff,bg=#0b2a5b,bold'
            _setw window-style               'fg=#9bb6d8,bg=#0b2a5b'
            _setw window-active-style        'fg=#dbeafe,bg=#0b2a5b'
            _setw pane-border-style          'fg=#1d3f78,bg=#0b2a5b'
            _setw pane-active-border-style   'fg=#5c9cff,bg=#0b2a5b'
            _set  message-style              'fg=#ffffff,bg=#12366f'
            ;;

        # --- GREEN2 (Green background with blue-style light foregrounds) ---
        green2|green-two|brightgreen|bright-green)
            # Background: #004d27; white/light foreground hierarchy modeled after blue
            _set  status-style               'fg=#eafff2,bg=#004d27'
            _set  window-status-style        'fg=#a7dcb9,bg=#004d27'
            _set  window-status-current-style 'fg=#ffffff,bg=#004d27,bold'
            _setw window-style               'fg=#a7dcb9,bg=#004d27'
            _setw window-active-style        'fg=#eafff2,bg=#004d27'
            _setw pane-border-style          'fg=#1d8a4a,bg=#004d27'
            _setw pane-active-border-style   'fg=#5cff9c,bg=#004d27'
            _set  message-style              'fg=#ffffff,bg=#176f3b'
            ;;

        # --- PURPLE (Creative/Writing - visible terminal magenta/purple) ---
        purple|creative|writing)
            # Background: visible purple tint; brighter active border
            _set  status-style               'fg=#f3e8ff,bg=#32104d'
            _set  window-status-style        'fg=#c5a6dd,bg=#32104d'
            _set  window-status-current-style 'fg=#ffffff,bg=#32104d,bold'
            _setw window-style               'fg=#c5a6dd,bg=#32104d'
            _setw window-active-style        'fg=#f3e8ff,bg=#32104d'
            _setw pane-border-style          'fg=#4a1c6c,bg=#32104d'
            _setw pane-active-border-style   'fg=#d56bff,bg=#32104d'
            _set  message-style              'fg=#ffffff,bg=#3f1760'
            ;;

        # --- ORANGE (Testing/Debugging - Background: #5b2c0b) ---
        orange|test|debug)
            # Background: #5b2c0b; text forced white
            _set  status-style               'fg=#ffffff,bg=#5b2c0b'
            _set  window-status-style        'fg=#ffffff,bg=#5b2c0b'
            _set  window-status-current-style 'fg=#ffffff,bg=#5b2c0b,bold'
            _setw window-style               'fg=#ffffff,bg=#5b2c0b'
            _setw window-active-style        'fg=#ffffff,bg=#5b2c0b'
            _setw pane-border-style          'fg=#ffffff,bg=#5b2c0b'
            _setw pane-active-border-style   'fg=#ffffff,bg=#5b2c0b'
            _set  message-style              'fg=#ffffff,bg=#5b2c0b'
            ;;

        # --- RED (Production/Urgent - visible terminal red) ---
        red|prod|urgent)
            # Background: visible red tint; brighter active border
            _set  status-style               'fg=#fee2e2,bg=#4a1010'
            _set  window-status-style        'fg=#d8a0a0,bg=#4a1010'
            _set  window-status-current-style 'fg=#ffffff,bg=#4a1010,bold'
            _setw window-style               'fg=#d8a0a0,bg=#4a1010'
            _setw window-active-style        'fg=#fee2e2,bg=#4a1010'
            _setw pane-border-style          'fg=#6e2020,bg=#4a1010'
            _setw pane-active-border-style   'fg=#ff5c5c,bg=#4a1010'
            _set  message-style              'fg=#ffffff,bg=#5b1717'
            ;;

        # --- NORD (Accent: #88c0d0) ---
        nord)
            # Background: #1f252d
            _set  status-style               'fg=#b8bcc0,bg=#1f252d'
            _set  window-status-style        'fg=#8a8f94,bg=#1f252d'
            _set  window-status-current-style 'fg=#c6cacf,bg=#1f252d,bold'
            _setw window-style               'fg=#8a8f94,bg=#1f252d'
            _setw window-active-style        'fg=#b8bcc0,bg=#1f252d'
            _setw pane-border-style          'fg=#2a2a2a,bg=#1f252d'
            _setw pane-active-border-style   'fg=#88c0d0,bg=#1f252d'
            _set  message-style              'fg=#c6cacf,bg=#262626'
            ;;

        # --- EVERFOREST (Accent: #a7c080) ---
        everforest|forest)
            # Background: #232a2e
            _set  status-style               'fg=#b8bcc0,bg=#232a2e'
            _set  window-status-style        'fg=#8a8f94,bg=#232a2e'
            _set  window-status-current-style 'fg=#c6cacf,bg=#232a2e,bold'
            _setw window-style               'fg=#8a8f94,bg=#232a2e'
            _setw window-active-style        'fg=#b8bcc0,bg=#232a2e'
            _setw pane-border-style          'fg=#2a2a2a,bg=#232a2e'
            _setw pane-active-border-style   'fg=#a7c080,bg=#232a2e'
            _set  message-style              'fg=#c6cacf,bg=#282828'
            ;;

        # --- GRUVBOX (Accent: #fabd2f) ---
        gruvbox)
            # Background: #202020
            _set  status-style               'fg=#b8bcc0,bg=#202020'
            _set  window-status-style        'fg=#8a8f94,bg=#202020'
            _set  window-status-current-style 'fg=#c6cacf,bg=#202020,bold'
            _setw window-style               'fg=#8a8f94,bg=#202020'
            _setw window-active-style        'fg=#b8bcc0,bg=#202020'
            _setw pane-border-style          'fg=#2a2a2a,bg=#202020'
            _setw pane-active-border-style   'fg=#fabd2f,bg=#202020'
            _set  message-style              'fg=#c6cacf,bg=#242424'
            ;;

        # ============================================
        # LIGHT THEMES
        # ============================================

        # --- PAPER (DEFAULT LIGHT - Neutral Accent) ---
        paper|light)
            # Background: #f3f3f1
            _set  status-style               'fg=#3f4347,bg=#f3f3f1'
            _set  window-status-style        'fg=#7a8086,bg=#f3f3f1'
            _set  window-status-current-style 'fg=#2f3336,bg=#f3f3f1,bold'
            _setw window-style               'fg=#7a8086,bg=#f3f3f1'
            _setw window-active-style        'fg=#3f4347,bg=#f3f3f1'
            _setw pane-border-style          'fg=#d2d6da,bg=#f3f3f1'
            _setw pane-active-border-style   'fg=#8a9096,bg=#f3f3f1'
            _set  message-style              'fg=#2f3336,bg=#e6e6e2'
            ;;

        # --- LCOBALT (Accent: #5f87a8) ---
        lcobalt)
            # Background: #eef3f7
            _set  status-style               'fg=#3f4347,bg=#eef3f7'
            _set  window-status-style        'fg=#7a8086,bg=#eef3f7'
            _set  window-status-current-style 'fg=#2f3336,bg=#eef3f7,bold'
            _setw window-style               'fg=#7a8086,bg=#eef3f7'
            _setw window-active-style        'fg=#3f4347,bg=#eef3f7'
            _setw pane-border-style          'fg=#d2d6da,bg=#eef3f7'
            _setw pane-active-border-style   'fg=#5f87a8,bg=#eef3f7'
            _set  message-style              'fg=#2f3336,bg=#e2e8ec'
            ;;

        # --- LGREEN (Accent: #98c379) ---
        lgreen)
            # Background: #eef7ea
            _set  status-style               'fg=#3f4347,bg=#eef7ea'
            _set  window-status-style        'fg=#7a8086,bg=#eef7ea'
            _set  window-status-current-style 'fg=#2f3336,bg=#eef7ea,bold'
            _setw window-style               'fg=#7a8086,bg=#eef7ea'
            _setw window-active-style        'fg=#3f4347,bg=#eef7ea'
            _setw pane-border-style          'fg=#d2d6da,bg=#eef7ea'
            _setw pane-active-border-style   'fg=#98c379,bg=#eef7ea'
            _set  message-style              'fg=#2f3336,bg=#e4ece6'
            ;;

        # --- LBLUE (visible terminal blue) ---
        lblue)
            # Background: visible blue wash; saturated active border
            _set  status-style               'fg=#1f2937,bg=#dbeafe'
            _set  window-status-style        'fg=#64748b,bg=#dbeafe'
            _set  window-status-current-style 'fg=#111827,bg=#dbeafe,bold'
            _setw window-style               'fg=#64748b,bg=#dbeafe'
            _setw window-active-style        'fg=#1f2937,bg=#dbeafe'
            _setw pane-border-style          'fg=#93c5fd,bg=#dbeafe'
            _setw pane-active-border-style   'fg=#0000ff,bg=#dbeafe'
            _set  message-style              'fg=#111827,bg=#bfdbfe'
            ;;

        # --- LPURPLE (visible terminal magenta/purple) ---
        lpurple)
            # Background: visible purple wash; saturated active border
            _set  status-style               'fg=#2f2437,bg=#f3e8ff'
            _set  window-status-style        'fg=#7e6a8f,bg=#f3e8ff'
            _set  window-status-current-style 'fg=#1f1028,bg=#f3e8ff,bold'
            _setw window-style               'fg=#7e6a8f,bg=#f3e8ff'
            _setw window-active-style        'fg=#2f2437,bg=#f3e8ff'
            _setw pane-border-style          'fg=#d8b4fe,bg=#f3e8ff'
            _setw pane-active-border-style   'fg=#cd00cd,bg=#f3e8ff'
            _set  message-style              'fg=#1f1028,bg=#e9d5ff'
            ;;

        # --- LORANGE (Accent: #fc6701) ---
        lorange)
            # Background: #fbf2e7
            _set  status-style               'fg=#3f4347,bg=#fbf2e7'
            _set  window-status-style        'fg=#7a8086,bg=#fbf2e7'
            _set  window-status-current-style 'fg=#2f3336,bg=#fbf2e7,bold'
            _setw window-style               'fg=#7a8086,bg=#fbf2e7'
            _setw window-active-style        'fg=#3f4347,bg=#fbf2e7'
            _setw pane-border-style          'fg=#d2d6da,bg=#fbf2e7'
            _setw pane-active-border-style   'fg=#fc6701,bg=#fbf2e7'
            _set  message-style              'fg=#2f3336,bg=#f2e8dc'
            ;;

        # --- LRED (visible terminal red) ---
        lred)
            # Background: visible red wash; saturated active border
            _set  status-style               'fg=#3a2222,bg=#fee2e2'
            _set  window-status-style        'fg=#8a6262,bg=#fee2e2'
            _set  window-status-current-style 'fg=#231010,bg=#fee2e2,bold'
            _setw window-style               'fg=#8a6262,bg=#fee2e2'
            _setw window-active-style        'fg=#3a2222,bg=#fee2e2'
            _setw pane-border-style          'fg=#fca5a5,bg=#fee2e2'
            _setw pane-active-border-style   'fg=#cd0000,bg=#fee2e2'
            _set  message-style              'fg=#231010,bg=#fecaca'
            ;;

        # --- LNORD (Accent: #88c0d0) ---
        lnord)
            # Background: #eef3f5
            _set  status-style               'fg=#3f4347,bg=#eef3f5'
            _set  window-status-style        'fg=#7a8086,bg=#eef3f5'
            _set  window-status-current-style 'fg=#2f3336,bg=#eef3f5,bold'
            _setw window-style               'fg=#7a8086,bg=#eef3f5'
            _setw window-active-style        'fg=#3f4347,bg=#eef3f5'
            _setw pane-border-style          'fg=#d2d6da,bg=#eef3f5'
            _setw pane-active-border-style   'fg=#88c0d0,bg=#eef3f5'
            _set  message-style              'fg=#2f3336,bg=#e4eaec'
            ;;

        # --- LEVERFOREST (Accent: #a7c080) ---
        leverforest)
            # Background: #f1f4ed
            _set  status-style               'fg=#3f4347,bg=#f1f4ed'
            _set  window-status-style        'fg=#7a8086,bg=#f1f4ed'
            _set  window-status-current-style 'fg=#2f3336,bg=#f1f4ed,bold'
            _setw window-style               'fg=#7a8086,bg=#f1f4ed'
            _setw window-active-style        'fg=#3f4347,bg=#f1f4ed'
            _setw pane-border-style          'fg=#d2d6da,bg=#f1f4ed'
            _setw pane-active-border-style   'fg=#a7c080,bg=#f1f4ed'
            _set  message-style              'fg=#2f3336,bg=#e7ece2'
            ;;

        # --- LGRUVBOX (Accent: #fabd2f) ---
        lgruvbox)
            # Background: #f6f1e4
            _set  status-style               'fg=#3f4347,bg=#f6f1e4'
            _set  window-status-style        'fg=#7a8086,bg=#f6f1e4'
            _set  window-status-current-style 'fg=#2f3336,bg=#f6f1e4,bold'
            _setw window-style               'fg=#7a8086,bg=#f6f1e4'
            _setw window-active-style        'fg=#3f4347,bg=#f6f1e4'
            _setw pane-border-style          'fg=#d2d6da,bg=#f6f1e4'
            _setw pane-active-border-style   'fg=#fabd2f,bg=#f6f1e4'
            _set  message-style              'fg=#2f3336,bg=#eee6d3'
            ;;

        *)
            echo "Unknown theme: $theme"
            echo ""
            echo "Dark themes:"
            echo "  black, transparent, graphite (default), retrogreen, cobalt, green, green2, blue"
            echo "  purple, orange, red, nord, everforest, gruvbox"
            echo ""
            echo "Light themes:"
            echo "  paper (default light), lcobalt, lgreen, lblue"
            echo "  lpurple, lorange, lred, lnord, leverforest, lgruvbox"
            return 1
            ;;
    esac

    # Hide pane-frame glyphs by matching their foreground to the theme's pane
    # background. pane-border-format (from ~/.tmux.conf) supplies the label color.
    pane_bg=$(tmux show-options -t "$session" -w -v pane-border-style 2>/dev/null | sed -n 's/.*bg=\([^,]*\).*/\1/p')
    if [[ -n "$pane_bg" && "$pane_bg" != default ]]; then
        _setw pane-border-style        "fg=$pane_bg,bg=$pane_bg"
        _setw pane-active-border-style "fg=$pane_bg,bg=$pane_bg"
    else
        # A transparent terminal does not expose its actual RGB background.
        _setw pane-border-style        'fg=#141414,bg=default'
        _setw pane-active-border-style 'fg=#141414,bg=default'
    fi

    # Bottom bar style is intentionally independent from pane theme.
    _apply_bar_style "$bar_style"

    # Refresh all clients to apply changes immediately
    tmux refresh-client -t "$session" 2>/dev/null || true

    echo "Applied '$theme' theme to session '$session' with '$bar_style' bar"
}

# Run standalone: bash themes.sh <theme> [session] [bar-style]
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    SESSION="${2:-$(tmux display-message -p '#S' 2>/dev/null)}"
    apply_theme "$1" "$SESSION" "${3:-theme}"
fi
