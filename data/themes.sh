#!/usr/bin/env bash
# ============================================
# TMUX COLOR THEMES
# ============================================

apply_theme() {
    local theme="$1"
    local session="$2"

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

    case "$theme" in
        # --- COBALT (Default, blu-grigio scuro) ---
        cobalt|default|"")
            _set  status-style               'bg=#1c212b,fg=#8fbcbb'
            _set  window-status-style        'bg=#1c212b,fg=#4c566a'
            _set  window-status-current-style 'bg=#1c212b,fg=#8fbcbb,bold'
            _setw window-style               'bg=#1c212b,fg=#9aa3b0'
            _setw window-active-style        'bg=#1c212b,fg=#d8dee9'
            _setw pane-border-style          'fg=#2e3440,bg=#1c212b'
            _setw pane-active-border-style   'fg=#5e81ac,bg=#1c212b'
            ;;

        # --- GREEN (Dev/Coding — verde menta) ---
        green|dev|coding)
            _set  status-style               'bg=#1a2b1a,fg=#a3be8c'
            _set  window-status-style        'bg=#1a2b1a,fg=#3d5a3d'
            _set  window-status-current-style 'bg=#1a2b1a,fg=#a3be8c,bold'
            _setw window-style               'bg=#1a2b1a,fg=#8aab8a'
            _setw window-active-style        'bg=#1a2b1a,fg=#d8efd8'
            _setw pane-border-style          'fg=#2e472e,bg=#1a2b1a'
            _setw pane-active-border-style   'fg=#a3be8c,bg=#1a2b1a'
            ;;

        # --- BLUE (Research/Learning — blu acceso) ---
        blue|research|learning)
            _set  status-style               'bg=#1a2233,fg=#81a1c1'
            _set  window-status-style        'bg=#1a2233,fg=#37476a'
            _set  window-status-current-style 'bg=#1a2233,fg=#88c0d0,bold'
            _setw window-style               'bg=#1a2233,fg=#7a96b5'
            _setw window-active-style        'bg=#1a2233,fg=#d8eaf5'
            _setw pane-border-style          'fg=#2a3a52,bg=#1a2233'
            _setw pane-active-border-style   'fg=#81a1c1,bg=#1a2233'
            ;;

        # --- PURPLE (Creative/Writing — viola lavanda) ---
        purple|creative|writing)
            _set  status-style               'bg=#251a30,fg=#b48ead'
            _set  window-status-style        'bg=#251a30,fg=#4a3560'
            _set  window-status-current-style 'bg=#251a30,fg=#c9a8d4,bold'
            _setw window-style               'bg=#251a30,fg=#9a7aaa'
            _setw window-active-style        'bg=#251a30,fg=#ead8f0'
            _setw pane-border-style          'fg=#3d2a50,bg=#251a30'
            _setw pane-active-border-style   'fg=#b48ead,bg=#251a30'
            ;;

        # --- ORANGE (Testing/Debugging) ---
        orange|test|debug)
            _set  status-style               'bg=#c98a3a,fg=#000000'
            _set  window-status-style        'bg=#c98a3a,fg=#3a2200'
            _set  window-status-current-style 'bg=#c98a3a,fg=#000000,bold'
            _setw window-style               'bg=#c98a3a,fg=#2a1800'
            _setw window-active-style        'bg=#c98a3a,fg=#000000'
            _setw pane-border-style          'fg=#a06c28,bg=#c98a3a'
            _setw pane-active-border-style   'fg=#000000,bg=#c98a3a'
            ;;

        # --- RED (Production/Urgent) ---
        red|prod|urgent)
            _set  status-style               'bg=#c4522a,fg=#000000'
            _set  window-status-style        'bg=#c4522a,fg=#3a1000'
            _set  window-status-current-style 'bg=#c4522a,fg=#000000,bold'
            _setw window-style               'bg=#c4522a,fg=#2a0c00'
            _setw window-active-style        'bg=#c4522a,fg=#000000'
            _setw pane-border-style          'fg=#9a3e1e,bg=#c4522a'
            _setw pane-active-border-style   'fg=#000000,bg=#c4522a'
            ;;

        # --- NORD (Artico, tonalità fredde) ---
        nord)
            _set  status-style               'bg=#2e3440,fg=#88c0d0'
            _set  window-status-style        'bg=#2e3440,fg=#4c566a'
            _set  window-status-current-style 'bg=#2e3440,fg=#81a1c1,bold'
            _setw window-style               'bg=#2e3440,fg=#7a96aa'
            _setw window-active-style        'bg=#2e3440,fg=#eceff4'
            _setw pane-border-style          'fg=#3b4252,bg=#2e3440'
            _setw pane-active-border-style   'fg=#88c0d0,bg=#2e3440'
            ;;

        # --- EVERFOREST (Verde muschio) ---
        everforest|forest)
            _set  status-style               'bg=#2d353b,fg=#a7c080'
            _set  window-status-style        'bg=#2d353b,fg=#475258'
            _set  window-status-current-style 'bg=#2d353b,fg=#83c092,bold'
            _setw window-style               'bg=#2d353b,fg=#7a9a80'
            _setw window-active-style        'bg=#2d353b,fg=#d3c6aa'
            _setw pane-border-style          'fg=#3d4a40,bg=#2d353b'
            _setw pane-active-border-style   'fg=#a7c080,bg=#2d353b'
            ;;

        # --- GRUVBOX (Retrò caldo) ---
        gruvbox)
            _set  status-style               'bg=#282828,fg=#b8bb26'
            _set  window-status-style        'bg=#282828,fg=#504945'
            _set  window-status-current-style 'bg=#282828,fg=#fabd2f,bold'
            _setw window-style               'bg=#282828,fg=#928374'
            _setw window-active-style        'bg=#282828,fg=#ebdbb2'
            _setw pane-border-style          'fg=#3c3836,bg=#282828'
            _setw pane-active-border-style   'fg=#fabd2f,bg=#282828'
            ;;

        *)
            echo "Unknown theme: $theme"
            echo "Available: cobalt, green, blue, purple, orange, red, nord, everforest, gruvbox"
            return 1
            ;;
    esac

    # Refresh all clients to apply changes immediately
    tmux refresh-client -t "$session" 2>/dev/null || true

    echo "Applied '$theme' theme to session '$session'"
}

# Run standalone: bash themes.sh <theme> <session>
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    apply_theme "$@"
fi
