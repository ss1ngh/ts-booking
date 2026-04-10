import { readFileSync } from 'fs';
import { join } from 'path';

function parseResults(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  
  let metrics = {
    http_req_duration: { values: [] },
    http_reqs: { values: [] },
    http_failures: { values: [] },
  };

  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      if (data.type === 'Point' && data.metric === 'http_req_duration') {
        metrics.http_req_duration.values.push(data.data.value);
      } else if (data.type === 'Point' && data.metric === 'http_reqs') {
        metrics.http_reqs.values.push(data.data.value);
      } else if (data.type === 'Point' && data.metric === 'http_failures') {
        metrics.http_failures.values.push(data.data.value);
      }
    } catch (e) {
      // Skip non-JSON lines
    }
  }

  const durations = metrics.http_req_duration.values;
  const avgLatency = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;
  
  const sorted = [...durations].sort((a, b) => a - b);
  const p95Index = Math.floor(sorted.length * 0.95);
  const p95Latency = sorted.length > 0 ? sorted[p95Index] : 0;

  const totalRequests = metrics.http_reqs.values.length > 0 
    ? metrics.http_reqs.values[metrics.http_reqs.values.length - 1] 
    : 0;
  const totalFailures = metrics.http_failures.values.length > 0 
    ? metrics.http_failures.values[metrics.http_failures.values.length - 1] 
    : 0;
  
  const failureRate = totalRequests > 0 ? totalFailures / totalRequests : 0;

  return { avgLatency, p95Latency, failureRate, totalRequests };
}

function main() {
  const baselinePath = join(process.cwd(), 'tests/results/baseline.json');
  const optimizedPath = join(process.cwd(), 'tests/results/optimized.json');

  console.log('\n=== Loading baseline results...');
  const baseline = parseResults(baselinePath);

  console.log('\n=== Loading optimized results...');
  const optimized = parseResults(optimizedPath);

  console.log('\n' + '='.repeat(60));
  console.log('              PERFORMANCE COMPARISON');
  console.log('='.repeat(60));

  console.log('\n┌─────────────────────┬──────────────┬──────────────┬──────────────┐');
  console.log('│ Metric              │ Baseline     │ Optimized    │ Delta        │');
  console.log('├─────────────────────┼──────────────┼──────────────┼──────────────┤');
  
  const avgImprovement = baseline.avgLatency > 0 
    ? ((baseline.avgLatency - optimized.avgLatency) / baseline.avgLatency * 100).toFixed(1) 
    : 0;
  const p95Improvement = baseline.p95Latency > 0 
    ? ((baseline.p95Latency - optimized.p95Latency) / baseline.p95Latency * 100).toFixed(1) 
    : 0;
  const failureDiff = ((optimized.failureRate - baseline.failureRate) * 100).toFixed(2);

  console.log(`│ Avg Latency (ms)    │ ${baseline.avgLatency.toFixed(2).padStart(12)} │ ${optimized.avgLatency.toFixed(2).padStart(12)} │ ${avgImprovement.padStart(12)}% │`);
  console.log(`│ P95 Latency (ms)    │ ${baseline.p95Latency.toFixed(2).padStart(12)} │ ${optimized.p95Latency.toFixed(2).padStart(12)} │ ${p95Improvement.padStart(12)}% │`);
  console.log(`│ Failure Rate (%)    │ ${(baseline.failureRate * 100).toFixed(2).padStart(12)} │ ${(optimized.failureRate * 100).toFixed(2).padStart(12)} │ ${failureDiff.padStart(12)} │`);
  console.log('└─────────────────────┴──────────────┴──────────────┴──────────────┘');

  console.log('\nNotes:');
  console.log('- Positive delta = improvement (lower is better for latency)');
  console.log('- Failure rate includes 429 (rate limited) responses');
  console.log('='.repeat(60) + '\n');
}

main();
