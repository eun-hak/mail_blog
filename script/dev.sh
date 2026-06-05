#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BACK_PID=""
FRONT_PID=""

cleanup() {
  echo ""
  echo "서버 종료 중..."
  [[ -n "$BACK_PID" ]] && kill "$BACK_PID" 2>/dev/null || true
  [[ -n "$FRONT_PID" ]] && kill "$FRONT_PID" 2>/dev/null || true
  wait "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM

if [[ ! -d node_modules ]]; then
  echo "백엔드 의존성 설치 중..."
  npm install
fi

if [[ ! -d frontend/node_modules ]]; then
  echo "프론트엔드 의존성 설치 중..."
  npm install --prefix frontend
fi

echo "백엔드 API 시작 → http://localhost:3001"
npm run dev &
BACK_PID=$!

echo "프론트엔드 시작 → http://localhost:5173"
npm run dev --prefix frontend &
FRONT_PID=$!

echo ""
echo "  백엔드:  http://localhost:3001"
echo "  프론트:  http://localhost:5173"
echo ""
echo "Ctrl+C 로 모두 종료합니다."
echo ""

wait "$BACK_PID" "$FRONT_PID"
