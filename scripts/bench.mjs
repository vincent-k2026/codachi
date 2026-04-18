#!/usr/bin/env node
/**
 * Benchmark codachi's render path. Validates the README's "~50ms render" claim
 * and catches regressions. Run with: `npm run bench` (builds first, then runs
 * against dist/).
 *
 * Reports p50/p95/p99 over N synthetic renders using a fixed fixture.
 * Exits non-zero if p95 exceeds BUDGET_MS so CI can gate on it.
 */
import { performance } from 'node:perf_hooks';
import { render } from '../dist/render/index.js';
import { getAnimalType, getPetColors } from '../dist/identity.js';
import { initSession, animTick, moodTick, sessionUptime } from '../dist/state.js';
import { getEventContext } from '../dist/events.js';
import { getAnimalName } from '../dist/animals/index.js';

const ITERATIONS = parseInt(process.env.BENCH_ITER || '500');
const WARMUP = 20;
const BUDGET_MS = parseFloat(process.env.BENCH_BUDGET_MS || '50');

function percentile(sorted, p) {
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

async function main() {
  initSession('bench-fake-transcript');

  // Swallow render output — we only care about timing.
  const origWrite = process.stdout.write.bind(process.stdout);
  let totalBytes = 0;
  process.stdout.write = (chunk) => { totalBytes += Buffer.byteLength(chunk); return true; };

  const renderOnce = () => {
    render({
      contextPercent: 42,
      modelName: 'Opus 4.6',
      animalType: getAnimalType(),
      colors: getPetColors(),
      git: null,
      project: { name: 'bench', language: 'TypeScript' },
      fiveHourUsage: { percent: 30, resetMinutes: 120 },
      sevenDayUsage: { percent: 10, resetMinutes: 5 * 24 * 60 },
      contextVelocity: 2.1,
      tokenSummary: '420K/1M',
      relationshipTier: 'friend',
      sessionNumber: 20,
      animTick: animTick(),
      moodTick: moodTick(),
      uptime: sessionUptime(),
      eventContext: getEventContext(),
      petName: getAnimalName(getAnimalType()),
      contextTimeRemaining: '~27m',
      tierUpgraded: false,
    });
  };

  for (let i = 0; i < WARMUP; i++) renderOnce();

  const samples = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const t0 = performance.now();
    renderOnce();
    samples.push(performance.now() - t0);
  }

  process.stdout.write = origWrite;

  samples.sort((a, b) => a - b);
  const p50 = percentile(samples, 0.5);
  const p95 = percentile(samples, 0.95);
  const p99 = percentile(samples, 0.99);
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;

  const fmt = (n) => n.toFixed(2) + 'ms';
  console.log(`codachi render benchmark (${ITERATIONS} iterations, ${totalBytes} bytes total output)`);
  console.log(`  avg: ${fmt(avg)}`);
  console.log(`  p50: ${fmt(p50)}`);
  console.log(`  p95: ${fmt(p95)}  (budget ${BUDGET_MS}ms)`);
  console.log(`  p99: ${fmt(p99)}`);

  if (p95 > BUDGET_MS) {
    console.error(`FAIL: p95 ${fmt(p95)} exceeds budget ${BUDGET_MS}ms`);
    process.exit(1);
  }
  console.log('PASS');
}

main().catch(err => { console.error(err); process.exit(1); });
