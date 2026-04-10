import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, stages, thresholds, userPayload } from '../utils/config.js';

export const options = {
  stages: stages,
  thresholds: thresholds,
};

export default function () {
  const payload = JSON.stringify({
    email: `testuser${Math.floor(Math.random() * 100000)}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/users`, payload, params);

  check(res, {
    'status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    'not rate limited': (r) => r.status !== 429,
  });

  sleep(1);
}
