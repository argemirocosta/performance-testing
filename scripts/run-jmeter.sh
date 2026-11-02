#!/usr/bin/env sh
# Runs the JMeter test plan (non-GUI) through the docker compose jmeter service.
# Usage: scripts/run-jmeter.sh <smoke|load>
#
# Each run gets a unique testid (used by the Grafana dashboard filter) and
# generates the JMeter HTML report in reports/<testid>/.
set -e

TEST_TYPE="$1"
case "$TEST_TYPE" in
  smoke) THREADS=1 RAMPUP=0 DURATION=60 ;;
  load) THREADS=20 RAMPUP=120 DURATION=420 ;;
  *)
    echo "Usage: $0 <smoke|load>" >&2
    exit 1
    ;;
esac

TESTID="jmeter-${TEST_TYPE}-$(date +%Y%m%d-%H%M%S)"
mkdir -p reports

echo "Running JMeter ${TEST_TYPE} test (testid: ${TESTID})"
docker compose run --rm --use-aliases jmeter -n \
  -t serverest.jmx \
  -q user.properties \
  -Jhost=serverest \
  -Jjmeter.reportgenerator.temp_dir=/tmp/jmeter-report \
  -Jtestid="${TESTID}" \
  -Jthreads="${THREADS}" \
  -Jrampup="${RAMPUP}" \
  -Jduration="${DURATION}" \
  -l "/reports/${TESTID}.jtl" \
  -j "/reports/${TESTID}.log" \
  -e -o "/reports/${TESTID}"

echo "HTML report: reports/${TESTID}/index.html"
