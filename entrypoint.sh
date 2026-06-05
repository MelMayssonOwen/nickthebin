#!/bin/sh
# Start nginx + a GoAccess loop that rebuilds the traffic dashboard from the logs.
LOG=/var/log/nginx/anon.log
OUT=/usr/share/nginx/html/stats/index.html

mkdir -p /usr/share/nginx/html/stats
# placeholder until the first data comes in
if [ ! -s "$OUT" ]; then
  printf '<!doctype html><meta charset="utf-8"><title>Stats</title><body style="font-family:monospace;background:#111;color:#ccc;padding:2rem">Stats warming up — visit the site, then refresh in ~30s.</body>' > "$OUT"
fi

# the base image symlinks logs to stdout; we need a real file for GoAccess
rm -f "$LOG"
touch "$LOG"

# rebuild the report every 30s in the background
(
  while true; do
    goaccess "$LOG" -o "$OUT" --log-format=COMBINED --html-report-title='Nick the Bin — traffic' >/dev/null 2>&1 || true
    sleep 30
  done
) &

exec nginx -g 'daemon off;'
