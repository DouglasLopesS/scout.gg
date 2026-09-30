interface CacheEntry<Value> {
  value: Value;
  expiresAt: number;
}

export class CachedRequestQueue<Key, Value> {
  private readonly fetchValue: (key: Key) => Promise<Value>;
  private readonly maxConcurrent: number;
  private readonly maxEntries: number;
  private readonly ttlMs: number;
  private readonly now: () => number;
  private readonly cache = new Map<Key, CacheEntry<Value>>();
  private readonly pending = new Map<Key, Promise<Value>>();
  private readonly waiters: Array<() => void> = [];
  private active = 0;

  constructor(
    fetchValue: (key: Key) => Promise<Value>,
    maxConcurrent: number,
    maxEntries: number,
    ttlMs: number,
    now: () => number = Date.now
  ) {
    this.fetchValue = fetchValue;
    this.maxConcurrent = maxConcurrent;
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
    this.now = now;
  }

  get(key: Key): Promise<Value> {
    const cached = this.cache.get(key);
    if (cached) {
      if (cached.expiresAt > this.now()) {
        this.cache.delete(key);
        this.cache.set(key, cached);
        return Promise.resolve(cached.value);
      }
      this.cache.delete(key);
    }

    const pending = this.pending.get(key);
    if (pending) return pending;

    const request = this.withSlot(() => this.fetchValue(key))
      .then((value) => {
        this.cache.set(key, { value, expiresAt: this.now() + this.ttlMs });
        while (this.cache.size > this.maxEntries) {
          const oldest = this.cache.keys().next();
          if (oldest.done) break;
          this.cache.delete(oldest.value);
        }
        return value;
      })
      .finally(() => this.pending.delete(key));

    this.pending.set(key, request);
    return request;
  }

  private async withSlot(run: () => Promise<Value>): Promise<Value> {
    await this.acquire();
    try {
      return await run();
    } finally {
      const next = this.waiters.shift();
      if (next) next();
      else this.active--;
    }
  }

  private acquire(): Promise<void> {
    if (this.active < this.maxConcurrent) {
      this.active++;
      return Promise.resolve();
    }
    return new Promise((resolve) => this.waiters.push(resolve));
  }
}
