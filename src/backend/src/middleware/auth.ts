import { Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthenticatedRequest, JwtPayload, UserRole } from '../types/index.js';
import { createContextLogger } from '../utils/logger.js';

const logger = createContextLogger('Auth');

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token', { error });
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const generateTokens = (payload: JwtPayload) => {
  const accessTokenOptions: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, accessTokenOptions);
  const refreshToken = jwt.sign({ userId: payload.userId }, config.jwt.secret, refreshTokenOptions);

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as { userId: string };
  } catch {
    return null;
  }
};
