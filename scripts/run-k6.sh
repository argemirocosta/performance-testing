#!/usr/bin/env sh
# Runs a k6 test through the docker compose k6 service.
# Usage: scripts/run-k6.sh <smoke|load|stress|spike|soak>
#
# Each run gets a unique testid (used by the Grafana dashboard filter) and
# exports an HTML report to reports/<testid>.html.
set -e

TEST_TYPE="$1"
case "$TEST_TYPE" in
  smoke | load | stress | spike | soak) ;;
  *)
    echo "Usage: $0 <smoke|load|stress|spike|soak>" >&2
    exit 1
    ;;
esac

TESTID="k6-${TEST_TYPE}-$(date +%Y%m%d-%H%M%S)"
mkdir -p reports

echo "Running k6 ${TEST_TYPE} test (testid: ${TESTID})"
docker compose run --rm \
  -e K6_WEB_DASHBOARD=true \
  -e K6_WEB_DASHBOARD_EXPORT="/reports/${TESTID}.html" \
  k6 run --tag testid="${TESTID}" "${TEST_TYPE}.ts"

echo "HTML report: reports/${TESTID}.html"
