#!/usr/bin/env bash
# ============================================
# TMUX THEME HOOK
# Automatically applies themes based on session name
# ============================================

source ~/.tmux/themes.sh

# Get current session name
SESSION=$(tmux display-message -p '#S' 2>/dev/null)

if [ -z "$SESSION" ]; then
    exit 0
fi

# Convert session name to lowercase for matching
SESSION_LOWER=$(echo "$SESSION" | tr '[:upper:]' '[:lower:]')

# Determine theme based on session name
THEME="graphite"  # default dark

case "$SESSION_LOWER" in
    # Green themes - Development/Coding
    *code*|*dev*|*coding*|*claude*|*qwen*|*ai*)
        THEME="green"
        ;;

    # Blue themes - Research/Learning
    *research*|*learn*|*study*|*doc*|*read*)
        THEME="blue"
        ;;

    # Purple themes - Creative/Writing
    *creative*|*write*|*note*|*idea*|*brain*)
        THEME="purple"
        ;;

    # Orange themes - Testing/Debugging
    *test*|*debug*|*spec*|*check*)
        THEME="orange"
        ;;

    # Red themes - Production/Urgent
    *prod*|*urgent*|*live*|*deploy*)
        THEME="red"
        ;;

    # Nord theme
    *nord*)
        THEME="nord"
        ;;

    # Everforest theme
    *forest*|*ever*|*nature*)
        THEME="everforest"
        ;;

    # Gruvbox theme
    *gruv*|*retro*|*warm*)
        THEME="gruvbox"
        ;;

    # Cobalt theme
    *cobalt*)
        THEME="cobalt"
        ;;

    # ============================================
    # LIGHT THEME TRIGGERS
    # ============================================

    # Paper (default light)
    *paper*|*light*)
        THEME="paper"
        ;;

    # Light variants
    *lcobalt*)
        THEME="lcobalt"
        ;;

    *lgreen*)
        THEME="lgreen"
        ;;

    *lblue*)
        THEME="lblue"
        ;;

    *lpurple*)
        THEME="lpurple"
        ;;

    *lorange*)
        THEME="lorange"
        ;;

    *lred*)
        THEME="lred"
        ;;

    *lnord*)
        THEME="lnord"
        ;;

    *leverforest*|*lforest*)
        THEME="leverforest"
        ;;

    *lgruv*)
        THEME="lgruvbox"
        ;;
esac

# Apply the theme
apply_theme "$THEME" "$SESSION"