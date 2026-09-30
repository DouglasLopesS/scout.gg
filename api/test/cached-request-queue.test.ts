import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CachedRequestQueue } from '../src/utils/cached-request-queue.ts';

test('reutiliza chamadas em andamento e respostas em cache', async () => {
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const queue = new CachedRequestQueue(async (key: string) => {
    calls++;
    await gate;
    return `partida-${key}`;
  }, 2, 10, 1_000);

  const first = queue.get('A');
  const second = queue.get('A');
  assert.strictEqual(first, second);
  release();
  assert.equal(await first, 'partida-A');
  assert.equal(await queue.get('A'), 'partida-A');
  assert.equal(calls, 1);
});

test('limita as chamadas simultâneas mesmo para IDs diferentes', async () => {
  let active = 0;
  let peak = 0;
  const started: string[] = [];
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const queue = new CachedRequestQueue(async (key: string) => {
    started.push(key);
    active++;
    peak = Math.max(peak, active);
    await gate;
    active--;
    return key;
  }, 2, 10, 1_000);

  const requests = ['A', 'B', 'C', 'D'].map((key) => queue.get(key));
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(started, ['A', 'B']);
  release();
  assert.deepEqual(await Promise.all(requests), ['A', 'B', 'C', 'D']);
  assert.equal(peak, 2);
});

test('expira entradas e remove a menos usada ao atingir o limite', async () => {
  let now = 0;
  const calls: string[] = [];
  const queue = new CachedRequestQueue(async (key: string) => {
    calls.push(key);
    return key;
  }, 2, 2, 100, () => now);

  await queue.get('A');
  await queue.get('B');
  await queue.get('A'); // A passa a ser a mais recente.
  await queue.get('C'); // B é removida.
  await queue.get('B');
  assert.deepEqual(calls, ['A', 'B', 'C', 'B']);
  now = 101;
  await queue.get('B');
  assert.deepEqual(calls, ['A', 'B', 'C', 'B', 'B']);
});

test('falhas liberam a fila e podem ser tentadas novamente', async () => {
  let failedCalls = 0;
  const queue = new CachedRequestQueue(async (key: string) => {
    if (key === 'falha' && failedCalls++ === 0) throw new Error('Riot indisponível');
    return key;
  }, 1, 10, 1_000);

  const results = await Promise.allSettled([queue.get('falha'), queue.get('ok')]);
  assert.equal(results[0]?.status, 'rejected');
  assert.equal(results[1]?.status, 'fulfilled');
  assert.equal(await queue.get('falha'), 'falha');
  assert.equal(failedCalls, 2);
});
