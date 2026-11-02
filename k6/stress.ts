// Stress test: increases the load in steps beyond the expected traffic to
// find the point where the API starts to degrade.
//   STEP_DURATION  time held at each step (default: 3m)
import { Options } from 'k6/options';
import { degradedThresholds } from './lib/config.ts';
import { cleanup, purchaseJourney, seedProducts, TestData } from './lib/flows.ts';

const STEP_DURATION = __ENV.STEP_DURATION || '3m';

export const options: Options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: STEP_DURATION, target: 20 },
        { duration: '30s', target: 50 },
        { duration: STEP_DURATION, target: 50 },
        { duration: '30s', target: 100 },
        { duration: STEP_DURATION, target: 100 },
        { duration: '30s', target: 150 },
        { duration: STEP_DURATION, target: 150 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: degradedThresholds,
  tags: { test_type: 'stress' },
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
