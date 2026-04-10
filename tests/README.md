# Load Testing & Performance Comparison

This directory contains k6-based load testing scenarios to compare baseline vs optimized (with Redis + rate limiting) performance.

## Prerequisites

- k6 installed: https://k6.io/docs/getting-started/installation/
- Backend server running on port 3000 (or set BASE_URL env var)
- Redis running (for optimized test)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| BASE_URL | Backend URL | http://localhost:3000 |
| USE_REDIS | Enable Redis | true |
| USE_RATE_LIMIT | Enable rate limiting | true |

## Running Tests

### Baseline Test (No Redis, No Rate Limiting)

```bash
USE_REDIS=false USE_RATE_LIMIT=false k6 run tests/scenarios/baseline.js --out json=tests/results/baseline.json
```

### Optimized Test (With Redis + Rate Limiting)

```bash
USE_REDIS=true USE_RATE_LIMIT=true k6 run tests/scenarios/optimized.js --out json=tests/results/optimized.json
```

## Comparing Results

```bash
node tests/compare.js
```

## Metrics Explained

| Metric | Description |
|--------|-------------|
| Avg Latency | Average response time in milliseconds |
| P95 Latency | 95th percentile response time |
| Failure Rate | Percentage of failed requests (includes 429 rate limited) |

## Test Configuration

The test stages ramp up from 0 → 20 → 50 → 100 users over ~4 minutes:

- **30s** - ramp to 20 users
- **1m** - ramp to 50 users  
- **2m** - peak at 100 users
- **30s** - ramp down to 0

### Thresholds

- p95 latency < 800ms
- error rate < 5%
