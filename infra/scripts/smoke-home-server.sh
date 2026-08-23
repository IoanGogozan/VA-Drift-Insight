#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://va.norvix.no}"
BASE_URL="${BASE_URL%/}"
RESOLVE_IP="${RESOLVE_IP:-}"
CURL_ARGS=(--fail --silent --show-error --location --max-time 30)

if [[ -n "$RESOLVE_IP" ]]; then
  host="${BASE_URL#*://}"
  host="${host%%/*}"
  CURL_ARGS+=(--resolve "${host}:443:${RESOLVE_IP}")
fi

check() {
  local label="$1"
  local path="$2"
  curl "${CURL_ARGS[@]}" "$BASE_URL$path" >/dev/null
  printf 'ok %s\n' "$label"
}

check "frontend" "/"
check "API health" "/api/health"
check "database health" "/api/health/db"
check "API version" "/api/version"
check "water zones" "/api/water-zones"
check "map assets" "/api/map/assets"

write_status="$(curl "${CURL_ARGS[@]}" --output /dev/null --write-out '%{http_code}' \
  --request POST "$BASE_URL/api/reports/va-risk" || true)"

if [[ "$write_status" != "401" ]]; then
  echo "expected protected report generation without a key to return 401, got $write_status" >&2
  exit 1
fi

printf 'ok protected demo write endpoint\n'

if [[ -n "${DEMO_API_KEY:-}" ]]; then
  work_dir="$(mktemp -d)"
  trap 'rm -rf "$work_dir"' EXIT

  curl "${CURL_ARGS[@]}" \
    --header "x-demo-api-key: $DEMO_API_KEY" \
    --request POST \
    --output "$work_dir/report.json" \
    "$BASE_URL/api/reports/va-risk"

  download_url="$(sed -n 's/.*"downloadUrl":"\([^"]*\)".*/\1/p' "$work_dir/report.json")"
  if [[ -z "$download_url" ]]; then
    echo "report response did not contain downloadUrl" >&2
    exit 1
  fi

  curl "${CURL_ARGS[@]}" \
    --output "$work_dir/report.pdf" \
    "$BASE_URL$download_url"

  if [[ "$(head -c 5 "$work_dir/report.pdf")" != "%PDF-" ]]; then
    echo "generated report is not a PDF" >&2
    exit 1
  fi

  printf 'ok PDF generation and download\n'
fi

echo "Home-server smoke tests passed for $BASE_URL"
