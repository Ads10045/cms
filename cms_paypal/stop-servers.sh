#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.server-pids"

echo "🛑 Arrêt des serveurs FemBeauty..."

if [ -f "$PID_FILE" ]; then
  while read pid; do
    kill "$pid" 2>/dev/null && echo "  ✅ PID $pid arrêté"
  done < "$PID_FILE"
  rm -f "$PID_FILE"
fi

# Nettoyage par nom au cas où
pkill -f "node.*local-web-test/backend/index.js" 2>/dev/null
pkill -f "cloudflared tunnel run fembeauty" 2>/dev/null

echo "❌ Serveurs arrêtés."
