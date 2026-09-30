import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../dist/app.js';
import { RiotClientRegistry } from '../dist/clients/riot-client-registry.js';
import { PLATFORM_REGIONS, isRiotPlatform, routingForPlatform } from '../src/config/riot-routing.ts';
import { RIOT_SERVERS } from '../../painel/src/app/shared/riot-routing.ts';

test('todas as opções do painel têm o mesmo roteamento na API', () => {
  assert.equal(RIOT_SERVERS.length, Object.keys(PLATFORM_REGIONS).length);
  for (const server of RIOT_SERVERS) {
    assert.equal(isRiotPlatform(server.platform), true);
    assert.deepEqual(routingForPlatform(server.platform), {
      platform: server.platform,
      region: server.region
    });
  }
  assert.deepEqual(routingForPlatform('oc1'), { platform: 'oc1', region: 'sea' });
  assert.deepEqual(routingForPlatform('euw1'), { platform: 'euw1', region: 'europe' });
});

test('reutiliza o cliente do mesmo servidor e separa os caches de servidores diferentes', () => {
  const clients = new RiotClientRegistry('test-key');
  assert.strictEqual(clients.get('br1'), clients.get('br1'));
  assert.notStrictEqual(clients.get('br1'), clients.get('na1'));
  assert.notStrictEqual(clients.get('na1'), clients.get('euw1'));
});

test('cache de partidas usa plataforma e região na chave', async () => {
  const clients = new RiotClientRegistry('test-key');
  const calls: string[] = [];
  for (const platform of ['br1', 'na1'] as const) {
    const client = clients.get(platform);
    client.getMatch = async (matchId: string) => {
      calls.push(`${platform}:${matchId}`);
      return { metadata: { matchId } } as Awaited<ReturnType<typeof client.getMatch>>;
    };
  }

  await clients.getMatch('br1', 'SAME_MATCH');
  await clients.getMatch('na1', 'SAME_MATCH');
  await clients.getMatch('br1', 'SAME_MATCH');
  assert.deepEqual(calls, ['br1:SAME_MATCH', 'na1:SAME_MATCH']);
});

test('limita a três chamadas simultâneas mesmo entre servidores diferentes', async () => {
  const clients = new RiotClientRegistry('test-key');
  const started: string[] = [];
  const releases: Array<() => void> = [];
  for (const platform of ['br1', 'na1', 'euw1', 'kr'] as const) {
    const client = clients.get(platform);
    client.getMatch = async (matchId: string) => {
      started.push(platform);
      await new Promise<void>((resolve) => releases.push(resolve));
      return { metadata: { matchId } } as Awaited<ReturnType<typeof client.getMatch>>;
    };
  }

  const requests = (['br1', 'na1', 'euw1', 'kr'] as const)
    .map((platform) => clients.getMatch(platform, 'SAME_MATCH'));
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(started, ['br1', 'na1', 'euw1']);
  releases.shift()?.();
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(started, ['br1', 'na1', 'euw1', 'kr']);
  for (const release of releases) release();
  await Promise.all(requests);
});

test('rejeita plataformas inválidas antes de consultar a Riot', async () => {
  const app = createApp({
    port: 0,
    painelUrl: 'http://localhost:4200',
    riot: { apiKey: 'test-key', platform: 'br1' }
  });
  const server = app.listen(0);
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const base = `http://127.0.0.1:${address.port}`;
    const paths = [
      '/player/Example/BR1?platform=invalid',
      `/player/${'A'.repeat(24)}/matches?platform=invalid`,
      '/matches/BR1_12345?platform=invalid',
      '/player/Example/BR1?platform=br1&platform=euw1'
    ];
    for (const path of paths) {
      const response = await fetch(`${base}${path}`);
      assert.equal(response.status, 400, path);
      const body = await response.json() as { error: { code: string } };
      assert.equal(body.error.code, 'INVALID_PLATFORM');
    }
  } finally {
    server.close();
  }
});
