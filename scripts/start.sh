#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

echo "Stopping old dev servers on ports 5173–5175…"
lsof -ti:5173,5174,5175 2>/dev/null | xargs kill -9 2>/dev/null || true

if [ ! -f .env ]; then
  echo ""
  echo "ERROR: .env file missing."
  echo "Copy .env.example to .env and add your OPENAI_API_KEY."
  echo ""
  exit 1
fi

if ! grep -qE '^OPENAI_API_KEY=sk-' .env 2>/dev/null; then
  echo ""
  echo "WARNING: OPENAI_API_KEY not set in .env (AI will not work locally)."
  echo ""
fi

echo "Starting dev server…"
npm run dev
