// Soak test: moderate load for a long period to reveal problems that only
// show up over time (memory leaks, gradual degradation, data growth).
//   VUS       virtual users during the test (default: 20)
//   DURATION  time at the target load (default: 1h)
import { Options } from 'k6/options';
import { defaultThresholds } from './lib/config.ts';
import { cleanup, purchaseJourney, seedProducts, TestData } from './lib/flows.ts';

const VUS = Number(__ENV.VUS || 20);
const DURATION = __ENV.DURATION || '1h';

export const options: Options = {
  scenarios: {
    soak: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: VUS },
        { duration: DURATION, target: VUS },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: defaultThresholds,
  tags: { test_type: 'soak' },
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
