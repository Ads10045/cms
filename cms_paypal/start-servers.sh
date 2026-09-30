#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs/local-web-test/backend"
BACKEND_DIR="$SCRIPT_DIR/local-web-test/backend"
PID_FILE="$SCRIPT_DIR/.server-pids"

mkdir -p "$LOG_DIR"

echo "🚀 Démarrage des serveurs FemBeauty..."

# Tuer les anciens processus si présents
if [ -f "$PID_FILE" ]; then
  while read pid; do kill "$pid" 2>/dev/null; done < "$PID_FILE"
  rm -f "$PID_FILE"
fi
pkill -f "node.*local-web-test/backend/index.js" 2>/dev/null
pkill -f "cloudflared tunnel run fembeauty" 2>/dev/null
sleep 1

# Démarrer le backend (avec les variables .env chargées via bash)
(
  set -a
  source "$BACKEND_DIR/.env" 2>/dev/null
  set +a
  nohup /opt/homebrew/bin/node "$BACKEND_DIR/index.js" \
    >> "$LOG_DIR/launchd_stdout.log" 2>&1 &
  echo $! >> "$PID_FILE"
  echo "  ✅ Backend démarré (PID $!)"
)

# Démarrer le tunnel Cloudflare
nohup /opt/homebrew/bin/cloudflared tunnel --protocol http2 run fembeauty \
  >> "$LOG_DIR/tunnel_stderr.log" 2>&1 &
echo $! >> "$PID_FILE"
echo "  ✅ Tunnel Cloudflare démarré (PID $!)"

sleep 3
echo ""
echo "🌐 Application disponible sur :"
echo "   http://localhost:20005         (local)"
echo "   https://fembeauty.site        (public)"
echo "   https://www.fembeauty.site    (public)"
