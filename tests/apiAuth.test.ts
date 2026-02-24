/**
 * Tests for requireApiKey middleware (api/index.ts)
 */

import { requireApiKey } from '../api/index';
import type { Request, Response, NextFunction } from 'express';

function mockReq(authHeader?: string): Partial<Request> {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  };
}

function mockRes(): { status: jest.Mock; json: jest.Mock; statusCode: number } {
  const res = {
    statusCode: 200,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

describe('requireApiKey middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('when MCP_API_KEY is not set', () => {
    test('allows the request through without any header', () => {
      delete process.env.MCP_API_KEY;
      const req = mockReq();
      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireApiKey(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('when MCP_API_KEY is set', () => {
    beforeEach(() => {
      process.env.MCP_API_KEY = 'test-secret-key';
    });

    test('allows the request with correct Bearer token', () => {
      const req = mockReq('Bearer test-secret-key');
      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireApiKey(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects the request with no Authorization header', () => {
      const req = mockReq();
      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireApiKey(req as Request, res as unknown as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    test('rejects the request with wrong token', () => {
      const req = mockReq('Bearer wrong-token');
      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireApiKey(req as Request, res as unknown as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    test('rejects the request with malformed Authorization header', () => {
      const req = mockReq('test-secret-key'); // sin "Bearer "
      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireApiKey(req as Request, res as unknown as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
