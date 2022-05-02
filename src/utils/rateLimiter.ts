import config from '../config';

class RateLimiter {
  private windowMs: number;
  private maxAttempts: number;

  private counter: Record<string, number> = {};

  constructor(windowMs: number, maxAttempts: number) {
    if (!windowMs || windowMs <= 0) {
      throw Error('Invalid rate limit window');
    }
    if (!maxAttempts || maxAttempts < 2) {
      throw Error('Invalid rate limit max attempts');
    }
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  increase(key: string) {
    if (this.counter[key]) {
      this.counter[key] += 1;
      return;
    }
    // On the first attempt, set a timer to reset counter when window ends
    this.counter[key] = 1;
    setTimeout(() => this.reset(key), this.windowMs);
  }

  reset(key: string) {
    if (!this.counter[key]) return;
    delete this.counter[key];
  }

  isReached(key: string): boolean {
    if (!this.counter[key]) return false;
    return this.counter[key] > this.maxAttempts;
  }
}

export const loginFailedRateLimiter = new RateLimiter(
  config.get('LOGIN_RATE_LIMITER_WINDOW_MS'),
  config.get('LOGIN_RATE_LIMITER_MAX_ATTEMPTS'),
);

export default RateLimiter;
