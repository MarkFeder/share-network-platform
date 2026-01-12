import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { redis } from '../utils/redis.js';
import { createContextLogger } from '../utils/logger.js';

const router = Router();
const prisma = new PrismaClient();
const logger = createContextLogger('Health');

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: boolean;
    redis: boolean;
  };
}

// Basic health check
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Detailed health check
router.get('/detailed', async (_req: Request, res: Response) => {
  const checks = {
    database: false,
    redis: false,
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    logger.error('Database health check failed', error);
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    logger.error('Redis health check failed', error);
  }

  const allHealthy = Object.values(checks).every(Boolean);
  const someHealthy = Object.values(checks).some(Boolean);

  const status: HealthStatus = {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };

  res.status(allHealthy ? 200 : someHealthy ? 200 : 503).json(status);
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.status(200).json({ ready: true });
  } catch {
    res.status(503).json({ ready: false });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ alive: true });
});

export default router;
