/**
 * Tests for Rate Limiter
 */

import { RateLimiter } from '../src/services/rateLimit';

describe('RateLimiter', () => {
  test('should initialize with correct config', () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 4,
      windowMs: 1000
    });

    const status = rateLimiter.getStatus();
    expect(status.maxRequests).toBe(4);
    expect(status.availableSlots).toBe(4);
    expect(status.requestsInWindow).toBe(0);
  });

  test('should allow requests up to maxRequests', async () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 1000
    });

    // Allow first two requests immediately
    await rateLimiter.waitForSlot();
    let status = rateLimiter.getStatus();
    expect(status.requestsInWindow).toBe(1);
    expect(status.availableSlots).toBe(1);

    await rateLimiter.waitForSlot();
    status = rateLimiter.getStatus();
    expect(status.requestsInWindow).toBe(2);
    expect(status.availableSlots).toBe(0);
  });

  test('should reset rate limiter', () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 4,
      windowMs: 1000
    });

    rateLimiter.reset();
    const status = rateLimiter.getStatus();
    expect(status.requestsInWindow).toBe(0);
    expect(status.availableSlots).toBe(4);
  });

  test('should return rate limit status', () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 4,
      windowMs: 1000
    });

    const status = rateLimiter.getStatus();
    expect(status).toHaveProperty('requestsInWindow');
    expect(status).toHaveProperty('maxRequests');
    expect(status).toHaveProperty('availableSlots');
    expect(status).toHaveProperty('nextAvailableAt');
  });
});
