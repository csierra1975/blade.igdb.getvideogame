/**
 * Rate Limiting Service
 * Implements local throttling to respect IGDB API rate limits
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestQueueItem {
  resolve: () => void;
  reject: (error: Error) => void;
}

export class RateLimiter {
  private maxRequests: number;
  private windowMs: number;
  private requestTimestamps: number[] = [];
  private requestQueue: RequestQueueItem[] = [];
  private processing = false;

  constructor(config: RateLimitConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
    console.error(
      `[RateLimiter] Initialized with ${this.maxRequests} requests per ${this.windowMs}ms`
    );
  }

  /**
   * Wait if necessary to comply with rate limits
   */
  async waitForSlot(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process the request queue
   */
  private processQueue(): void {
    if (this.processing) {
      return;
    }

    this.processing = true;

    const processNextRequest = () => {
      if (this.requestQueue.length === 0) {
        this.processing = false;
        return;
      }

      const now = Date.now();

      // Remove timestamps outside the current window
      this.requestTimestamps = this.requestTimestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      );

      if (this.requestTimestamps.length < this.maxRequests) {
        // We have capacity, process immediately
        const item = this.requestQueue.shift();
        if (item) {
          this.requestTimestamps.push(now);
          console.log(
            `[RateLimiter] Allowing request (${this.requestTimestamps.length}/${this.maxRequests})`
          );
          item.resolve();
        }
        // Process next immediately
        setImmediate(processNextRequest);
      } else {
        // We're at capacity, calculate wait time
        const oldestTimestamp = this.requestTimestamps[0];
        const waitTime = this.windowMs - (now - oldestTimestamp) + 10; // +10ms buffer

        console.log(
          `[RateLimiter] Rate limit reached, waiting ${waitTime}ms before next request`
        );

        setTimeout(processNextRequest, waitTime);
      }
    };

    processNextRequest();
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    requestsInWindow: number;
    maxRequests: number;
    availableSlots: number;
    nextAvailableAt: number;
  } {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    const availableSlots = Math.max(0, this.maxRequests - this.requestTimestamps.length);
    let nextAvailableAt = 0;

    if (this.requestTimestamps.length >= this.maxRequests) {
      const oldestTimestamp = this.requestTimestamps[0];
      nextAvailableAt = oldestTimestamp + this.windowMs;
    }

    return {
      requestsInWindow: this.requestTimestamps.length,
      maxRequests: this.maxRequests,
      availableSlots,
      nextAvailableAt
    };
  }

  /**
   * Reset rate limiter
   */
  reset(): void {
    this.requestTimestamps = [];
    this.requestQueue = [];
    console.log('[RateLimiter] Rate limiter reset');
  }
}
