import { RiotClient } from './riot.client.js';
import { routingForPlatform, type RiotPlatform } from '../config/riot-routing.js';
import type { RiotMatchDto } from '../types/riot.types.js';
import { CachedRequestQueue } from '../utils/cached-request-queue.js';
import { RiotRateLimiter } from '../utils/riot-rate-limiter.js';

const MATCH_REQUEST_CONCURRENCY = 3;
const MATCH_CACHE_MAX_ENTRIES = 300;
const MATCH_CACHE_TTL_MS = 60 * 60 * 1000;

export class RiotClientRegistry {
  private readonly clients = new Map<string, RiotClient>();
  private readonly rateLimiter = new RiotRateLimiter();
  private readonly matchRequests = new CachedRequestQueue<string, RiotMatchDto>(
    (key) => {
      const [platform, , matchId] = key.split(':') as [RiotPlatform, string, string];
      return this.get(platform).getMatch(matchId);
    },
    MATCH_REQUEST_CONCURRENCY,
    MATCH_CACHE_MAX_ENTRIES,
    MATCH_CACHE_TTL_MS
  );

  constructor(private readonly apiKey: string) {}

  get(platform: RiotPlatform): RiotClient {
    const routing = routingForPlatform(platform);
    const key = `${routing.platform}:${routing.region}`;
    let client = this.clients.get(key);
    if (!client) {
      client = new RiotClient({ apiKey: this.apiKey, ...routing }, this.rateLimiter);
      this.clients.set(key, client);
    }
    return client;
  }

  getMatch(platform: RiotPlatform, matchId: string): Promise<RiotMatchDto> {
    const { region } = routingForPlatform(platform);
    return this.matchRequests.get(`${platform}:${region}:${matchId}`);
  }
}
