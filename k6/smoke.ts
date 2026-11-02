// Smoke test: minimal load to validate that the API and the test script
// work end to end before running heavier tests.
import { Options } from 'k6/options';
import { defaultThresholds } from './lib/config.ts';
import { cleanup, purchaseJourney, seedProducts, TestData } from './lib/flows.ts';

export const options: Options = {
  vus: 1,
  duration: '1m',
  thresholds: defaultThresholds,
  tags: { test_type: 'smoke' },
};

export function setup(): TestData {
  return seedProducts(5);
}

export default function (data: TestData): void {
  purchaseJourney(data);
}

export function teardown(data: TestData): void {
  cleanup(data);
}
