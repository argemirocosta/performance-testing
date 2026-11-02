// Spike test: a sudden burst of users over a small baseline, followed by a
// recovery period to check that the API returns to normal afterwards.
//   SPIKE_VUS  virtual users at the peak (default: 200)
import { Options } from 'k6/options';
import { degradedThresholds } from './lib/config.ts';
import { cleanup, purchaseJourney, seedProducts, TestData } from './lib/flows.ts';

const BASELINE_VUS = 5;
const SPIKE_VUS = Number(__ENV.SPIKE_VUS || 200);

export const options: Options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: BASELINE_VUS,
      stages: [
        { duration: '1m', target: BASELINE_VUS },
        { duration: '10s', target: SPIKE_VUS },
        { duration: '1m', target: SPIKE_VUS },
        { duration: '10s', target: BASELINE_VUS },
        { duration: '2m', target: BASELINE_VUS },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: degradedThresholds,
  tags: { test_type: 'spike' },
};

export function setup(): TestData {
  return seedProducts(20);
}

export default function (data: TestData): void {
  purchaseJourney(data);
}

export function teardown(data: TestData): void {
  cleanup(data);
}
