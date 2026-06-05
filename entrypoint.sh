#!/bin/sh
# Start nginx + a GoAccess loop that rebuilds the traffic dashboard from the logs.
# The log lives on a persistent /data volume so history survives redeploys.
LOG=/data/access.log
OUT=/usr/share/nginx/html/stats/index.html

mkdir -p /data /usr/share/nginx/html/stats
[ -f "$LOG" ] || touch "$LOG"          # never wipe — it persists across versions
if [ ! -s "$OUT" ]; then
  printf '<!doctype html><meta charset="utf-8"><title>Stats</title><body style="font-family:monospace;background:#111;color:#ccc;padding:2rem">Stats warming up — visit the site, then refresh in ~30s.</body>' > "$OUT"
fi

# rebuild the report every 30s from the full (persistent) log
(
  while true; do
    goaccess "$LOG" -o "$OUT" --log-format=COMBINED --html-report-title='Nick the Bin — traffic' >/dev/null 2>&1 || true
    sleep 30
  done
) &

exec nginx -g 'daemon off;'
