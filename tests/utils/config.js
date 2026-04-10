export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const stages = [
  { duration: '30s', target: 20 },
  { duration: '1m', target: 50 },
  { duration: '2m', target: 100 },
  { duration: '30s', target: 0 },
];

export const thresholds = {
  http_req_duration: ['p(95)<800'],
  http_reqs: ['count>0'],
  http_req_failed: ['rate<0.05'],
};

export const userPayload = {
  email: `testuser${Math.floor(Math.random() * 100000)}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
};
