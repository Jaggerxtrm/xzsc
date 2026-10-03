#!/usr/bin/env sh
# Portable tmux clipboard bridge.
# - Local Wayland/X11/macOS/WSL: use the native clipboard tool.
# - SSH/headless/VPS: fall back to tmux OSC52 via `load-buffer -w`, which
#   asks the *client terminal* to copy the selection.

set -u

# Client tty of the tmux client that triggered the copy, passed by the
# keybindings as $1 (expanded from #{client_tty}). Used to target the OSC 52
# fallback at the right client when several are attached.
tty="${1:-}"

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT HUP INT TERM
cat > "$tmp"

# ponytail: pane env goes stale when tmux is boot-started before the graphical
# session. Refresh clipboard-relevant vars from tmux's own environment so
# wl-copy/xclip see the current Wayland/X11 socket instead of falling back to OSC52.
if [ -n "${TMUX:-}" ] && command -v tmux >/dev/null 2>&1; then
  for var in WAYLAND_DISPLAY XDG_RUNTIME_DIR DISPLAY XAUTHORITY DBUS_SESSION_BUS_ADDRESS; do
    line="$(tmux show-environment "$var" 2>/dev/null)"
    case "$line" in
      "$var="*) export "$line" ;;
    esac
  done
fi

if command -v wl-copy >/dev/null 2>&1 \
  && [ -n "${WAYLAND_DISPLAY:-}" ] \
  && [ -n "${XDG_RUNTIME_DIR:-}" ]; then
  wl-copy < "$tmp" && exit 0
fi

if command -v xclip >/dev/null 2>&1 && [ -n "${DISPLAY:-}" ]; then
  xclip -selection clipboard < "$tmp" && exit 0
fi

if command -v xsel >/dev/null 2>&1 && [ -n "${DISPLAY:-}" ]; then
  xsel -i --clipboard < "$tmp" && exit 0
fi

if command -v pbcopy >/dev/null 2>&1; then
  pbcopy < "$tmp" && exit 0
fi

if command -v clip.exe >/dev/null 2>&1; then
  clip.exe < "$tmp" && exit 0
fi

# Reverse-tunnel clipboard bridge, broadcast: every machine that has a
# listener running plus its own RemoteForward port (desktop 8377, laptop
# 8378, ...) receives the selection, so the copy lands on ALL your machines'
# clipboards. Setup per machine: run clipboard-bridge-listener.py <port> and
# add `RemoteForward <port> 127.0.0.1:<port>` to that machine's ~/.ssh/config
# plus ControlMaster so concurrent SSH sessions share one forward.
# Frame is "CLIP1 <base64>\n"; the listener validates the magic and drops
# anything else. `timeout` bounds a hung listener so tmux never stalls
# (copy-pipe-and-cancel waits for this command).
if command -v nc >/dev/null 2>&1 && [ "$(wc -c < "$tmp")" -le 1048576 ]; then
  frame="CLIP1 $(base64 -w0 < "$tmp")"
  sent=0
  for p in 8377 8378 8379 8380; do
    timeout 2 nc -N -w 1 127.0.0.1 "$p" <<EOF 2>/dev/null && sent=1
$frame
EOF
  done
  [ "$sent" -eq 1 ] && exit 0
fi

# OSC 52 fallback, written to the SPECIFIC client that triggered the copy
# (the binding passes its tty as $1). Only terminals with OSC 52 support
# apply it — GNOME Terminal/VTE ignores OSC 52 (verified in vte src/vteseq.cc).
if command -v tmux >/dev/null 2>&1 && [ -n "${TMUX:-}" ]; then
  if [ -n "${tty:-}" ]; then
    tmux load-buffer -w -t "$tty" "$tmp" && exit 0
  fi
  tmux load-buffer -w "$tmp" && exit 0
fi

# Keep copy-mode from erroring loudly if no clipboard mechanism exists.
cat "$tmp" >/dev/null
exit 1
