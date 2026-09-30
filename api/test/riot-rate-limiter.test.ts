import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AxiosError, AxiosHeaders, type AxiosInstance, type AxiosResponse } from 'axios';
import { RiotClient } from '../dist/clients/riot.client.js';
import { RiotRateLimiter } from '../dist/utils/riot-rate-limiter.js';

function riotError(status: number, retryAfter?: string): AxiosError {
  return new AxiosError('Riot error', undefined, undefined, undefined, {
    status,
    headers: AxiosHeaders.from(retryAfter === undefined ? {} : { 'Retry-After': retryAfter })
  } as AxiosResponse);
}

test('aguarda Retry-After e repete a chamada após um 429', async () => {
  let now = 0;
  const waits: number[] = [];
  const limiter = new RiotRateLimiter(() => now, async (ms) => {
    waits.push(ms);
    now += ms;
  });
  let calls = 0;

  const result = await limiter.execute(async () => {
    if (calls++ === 0) throw riotError(429, '2');
    return 'ok';
  });

  assert.equal(result, 'ok');
  assert.equal(calls, 2);
  assert.deepEqual(waits, [2_000]);
});

test('aplica a pausa também às próximas chamadas e limita as tentativas', async () => {
  let now = 0;
  const waits: number[] = [];
  const limiter = new RiotRateLimiter(() => now, async (ms) => {
    waits.push(ms);
    now += ms;
  });
  let calls = 0;

  await assert.rejects(limiter.execute(async () => {
    calls++;
    throw riotError(429, '3');
  }), (error: unknown) => error instanceof AxiosError && error.response?.status === 429);

  assert.equal(calls, 3);
  assert.deepEqual(waits, [3_000, 3_000]);
  await limiter.execute(async () => 'próxima chamada');
  assert.deepEqual(waits, [3_000, 3_000, 3_000]);
});

test('usa uma espera curta quando Retry-After não é válido', async () => {
  let now = 0;
  const waits: number[] = [];
  const limiter = new RiotRateLimiter(() => now, async (ms) => {
    waits.push(ms);
    now += ms;
  });
  let calls = 0;

  await limiter.execute(async () => {
    if (calls++ === 0) throw riotError(429, 'inválido');
    return 'ok';
  });
  assert.deepEqual(waits, [1_000]);
});

test('não repete erros diferentes de 429', async () => {
  const limiter = new RiotRateLimiter();
  let calls = 0;
  await assert.rejects(limiter.execute(async () => {
    calls++;
    throw riotError(403);
  }));
  assert.equal(calls, 1);
});

test('o cliente HTTP da Riot reaplica uma chamada de conta após 429', async () => {
  let now = 0;
  const limiter = new RiotRateLimiter(() => now, async (ms) => { now += ms; });
  const client = new RiotClient({ apiKey: 'test-key', platform: 'br1', region: 'americas' }, limiter);
  const accountClient = Reflect.get(client, 'accountClient') as AxiosInstance;
  let calls = 0;
  accountClient.defaults.adapter = async (config) => {
    calls++;
    if (calls === 1) {
      throw new AxiosError('limited', undefined, config, undefined, {
        config, status: 429, statusText: 'Too Many Requests',
        headers: AxiosHeaders.from({ 'Retry-After': '2' }), data: null
      });
    }
    return {
      config, status: 200, statusText: 'OK', headers: AxiosHeaders.from({}),
      data: { puuid: 'example', gameName: 'Jogador', tagLine: 'BR1' }
    };
  };

  assert.equal((await client.getAccountByRiotId('Jogador', 'BR1')).puuid, 'example');
  assert.equal(calls, 2);
  assert.equal(now, 2_000);
});
