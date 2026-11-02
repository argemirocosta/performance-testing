// BASE_URL is set by the k6 service in docker-compose.yml; the fallback
// allows running the scripts with a local k6 binary.
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Baseline service level objectives shared by every test type.
// Individual tests may extend or override them.
export const defaultThresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  checks: ['rate>0.99'],
};

// Relaxed limits for tests that push the API beyond its expected load
// (stress, spike): degradation is expected, a collapse is not.
export const degradedThresholds = {
  http_req_failed: ['rate<0.05'],
  http_req_duration: ['p(95)<1500'],
  checks: ['rate>0.95'],
};
