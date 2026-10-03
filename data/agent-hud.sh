#!/usr/bin/env bash
# agent HUD popup — glanceable list of agent panes across all sessions.
# reads the same @agent_state pane options the session picker uses.
# redraws every 2s while open; any key closes. --once renders a single frame.
set -u

interval=2
once=0
[ "${1:-}" = "--once" ] && once=1

c_reset=$'\033[0m'
c_head=$'\033[38;5;244m'
c_input=$'\033[38;5;216m\033[1m'   # needs-input: accent #f4bf75
c_run=$'\033[38;5;114m'           # running: green
c_idle=$'\033[38;5;246m'          # idle
c_done=$'\033[38;5;244m'          # done
c_dim=$'\033[38;5;238m'           # metadata
c_name=$'\033[38;5;255m'

state_color() {
    case "$1" in
        needs-input) printf '%s' "$c_input" ;;
        running)     printf '%s' "$c_run" ;;
        idle)        printf '%s' "$c_idle" ;;
        *)           printf '%s' "$c_done" ;;
    esac
}

frame() {
    local now
    now=$(date +%H:%M:%S)
    printf '%s AGENTS  %supdated %s · any key closes%s\n\n' \
        "$c_head" "$c_dim" "$now" "$c_reset"

    # tab-separated like the picker; sanitize tabs/newlines inside values
    tmux list-panes -a -F $'#{s/\t/ /:#{s/\n/ /:session_name}}\t#{window_index}\t#{pane_index}\t#{?@agent_state,#{s/\t/ /:#{s/\n/ /:@agent_state}},}\t#{s/\t/ /:#{s/\n/ /:pane_current_command}}\t#{s/\t/ /:#{s/\n/ /:@agent_task}}' \
    | awk -F '\t' '
        $4 != "" && $4 != "off" {
            rank = ($4=="needs-input")?0 : ($4=="running")?1 : ($4=="idle")?2 : 3
            printf "%d\t%s\t%s\t%s\t%s\t%s\t%s\n", rank,$1,$2,$3,$4,$5,$6
        }' \
    | sort -n -k1,1 -s -k2,2 \
    | cut -f2- \
    | while IFS=$'\t' read -r sess win pane state cmd task; do
        printf ' %s%-12s%s %s%s %s.%s%s  %s%s%s%s\n' \
            "$(state_color "$state")" "$state" "$c_reset" \
            "$c_name" "$sess" "$win" "$pane" "$c_reset" \
            "$c_dim" "$cmd" "${task:+ · $task}" "$c_reset"
      done

    printf '\n'
}

if [ "$once" = 1 ]; then
    frame
    exit 0
fi

tput civis 2>/dev/null
trap 'tput cnorm 2>/dev/null; exit 0' INT TERM EXIT
while :; do
    printf '\033[H\033[2J'
    frame
    IFS= read -rsn1 -t "$interval" k </dev/tty && exit 0
done
