import { AxiosError } from 'axios';

const MAX_RETRIES = 2;
const FALLBACK_RETRY_AFTER_MS = 1_000;

export class RiotRateLimiter {
  private blockedUntil = 0;

  constructor(
    private readonly now: () => number = Date.now,
    private readonly sleep: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms))
  ) {}

  async execute<T>(call: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      await this.waitForCooldown();
      try {
        return await call();
      } catch (error: unknown) {
        if (!(error instanceof AxiosError) || error.response?.status !== 429) throw error;

        const headers = error.response.headers;
        const retryAfter = this.retryAfterMs(
          typeof headers.get === 'function'
            ? headers.get('Retry-After')
            : headers['retry-after'] ?? headers['Retry-After']
        );
        this.blockedUntil = Math.max(this.blockedUntil, this.now() + retryAfter);
        if (attempt >= MAX_RETRIES) throw error;
      }
    }
  }

  private async waitForCooldown(): Promise<void> {
    let remaining = this.blockedUntil - this.now();
    while (remaining > 0) {
      await this.sleep(remaining);
      remaining = this.blockedUntil - this.now();
    }
  }

  private retryAfterMs(value: unknown): number {
    const seconds = typeof value === 'number' || typeof value === 'string'
      ? Number(value)
      : NaN;
    return Number.isFinite(seconds) && seconds >= 0
      ? seconds * 1_000
      : FALLBACK_RETRY_AFTER_MS;
  }
}
