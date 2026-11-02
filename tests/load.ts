// Load test: simulates the expected day-to-day traffic to validate that
// the API meets the service level objectives under normal conditions.
//   VUS       target virtual users (default: 20)
//   DURATION  time at the target load (default: 5m)
import { Options } from 'k6/options';
import { defaultThresholds } from './lib/config.ts';
import { cleanup, purchaseJourney, seedProducts, TestData } from './lib/flows.ts';

const VUS = Number(__ENV.VUS || 20);
const DURATION = __ENV.DURATION || '5m';

export const options: Options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: VUS },
        { duration: DURATION, target: VUS },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: defaultThresholds,
  tags: { test_type: 'load' },
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
