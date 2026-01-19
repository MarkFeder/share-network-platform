import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, generateTokens, verifyRefreshToken } from '../../../middleware/auth';
import { AuthenticatedRequest, UserRole } from '../../../types';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  const jwtSecret = 'test-secret-key-minimum-32-characters-long';

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should return 401 when no authorization header is provided', () => {
      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      mockReq.headers = { authorization: 'Basic token123' };

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
    });

    it('should return 401 when token is invalid', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should call next and set user when token is valid', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        organizationId: 'org-123',
      };
      const token = jwt.sign(payload, jwtSecret);
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as AuthenticatedRequest).user).toMatchObject(payload);
    });

    it('should return 401 when token is expired', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        organizationId: 'org-123',
      };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '-1s' });
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });
  });

  describe('authorize', () => {
    it('should return 401 when user is not authenticated', () => {
      const authorizeMiddleware = authorize(UserRole.ADMIN);

      authorizeMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

    it('should return 403 when user lacks required role', () => {
      mockReq.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.VIEWER,
        organizationId: 'org-123',
      };
      const authorizeMiddleware = authorize(UserRole.ADMIN);

      authorizeMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    });

    it('should call next when user has exact required role', () => {
      mockReq.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        organizationId: 'org-123',
      };
      const authorizeMiddleware = authorize(UserRole.ADMIN);

      authorizeMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next when user has one of multiple allowed roles', () => {
      mockReq.user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.OPERATOR,
        organizationId: 'org-123',
      };
      const authorizeMiddleware = authorize(UserRole.ADMIN, UserRole.OPERATOR);

      authorizeMiddleware(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        organizationId: 'org-123',
      };

      const tokens = generateTokens(payload);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate tokens that can be decoded', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        organizationId: 'org-123',
      };

      const tokens = generateTokens(payload);
      const decoded = jwt.verify(tokens.accessToken, jwtSecret) as Record<string, unknown>;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return decoded payload for valid refresh token', () => {
      const refreshToken = jwt.sign({ userId: 'user-123' }, jwtSecret);

      const result = verifyRefreshToken(refreshToken);

      expect(result).toMatchObject({ userId: 'user-123' });
    });

    it('should return null for invalid refresh token', () => {
      const result = verifyRefreshToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for expired refresh token', () => {
      const refreshToken = jwt.sign({ userId: 'user-123' }, jwtSecret, { expiresIn: '-1s' });

      const result = verifyRefreshToken(refreshToken);

      expect(result).toBeNull();
    });
  });
});
