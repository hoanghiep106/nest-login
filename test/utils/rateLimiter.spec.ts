import RateLimiter from 'src/utils/rateLimiter';

describe('RateLimiter', () => {
  const windowMs = 100;
  const maxAttempts = 2;

  it('rate limit should not be reached', () => {
    const rateLimiter = new RateLimiter(windowMs, maxAttempts);
    const testKey = 'hiep';
    // First attempt
    rateLimiter.increase(testKey);
    expect(rateLimiter.isReached(testKey)).toEqual(false);
    // Second attempt
    rateLimiter.increase(testKey);
    expect(rateLimiter.isReached(testKey)).toEqual(false);
  });

  it('rate limit should be reached', () => {
    const rateLimiter = new RateLimiter(windowMs, maxAttempts);
    const testKey = 'hiep';

    // Try 3 attempts
    rateLimiter.increase(testKey);
    rateLimiter.increase(testKey);
    rateLimiter.increase(testKey);
    expect(rateLimiter.isReached(testKey)).toEqual(true);
  });

  it('counter should be reset automatically', () => {
    const rateLimiter = new RateLimiter(windowMs, maxAttempts);
    const testKey = 'hiep';
    // First attempt
    rateLimiter.increase(testKey);
    expect(rateLimiter.isReached(testKey)).toEqual(false);
    // Second attempt
    rateLimiter.increase(testKey);
    expect(rateLimiter.isReached(testKey)).toEqual(false);

    setTimeout(() => {
      // Third attempt but time window has been reset
      rateLimiter.increase(testKey);
      expect(rateLimiter.isReached(testKey)).toEqual(false);
    }, 100);
  });

  it('reset counter manually', () => {
    const rateLimiter = new RateLimiter(windowMs, maxAttempts);
    const testKey = 'hiep';

    rateLimiter.increase(testKey);
    rateLimiter.increase(testKey);

    rateLimiter.reset(testKey);

    rateLimiter.increase(testKey);

    expect(rateLimiter.isReached(testKey)).toEqual(false);
  });
});
