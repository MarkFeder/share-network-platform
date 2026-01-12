import { Router, Response } from 'express';
import { z } from 'zod';
import { telemetryService } from '../services/telemetryService.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

// Validation schemas
const telemetryInputSchema = z.object({
  deviceId: z.string().uuid(),
  latencyMs: z.number().min(0).optional(),
  jitterMs: z.number().min(0).optional(),
  packetLoss: z.number().min(0).max(100).optional(),
  bandwidthUp: z.number().min(0).optional(),
  bandwidthDown: z.number().min(0).optional(),
  cpuUsage: z.number().min(0).max(100).optional(),
  memoryUsage: z.number().min(0).max(100).optional(),
  diskUsage: z.number().min(0).max(100).optional(),
  temperature: z.number().optional(),
  signalStrength: z.number().optional(),
  connectedClients: z.number().int().min(0).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const batchInputSchema = z.object({
  data: z.array(telemetryInputSchema).max(1000),
});

const historyQuerySchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  limit: z.coerce.number().int().min(1).max(10000).default(1000),
});

const aggregateQuerySchema = z.object({
  period: z.enum(['hourly', 'daily']),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

// Routes
router.use(authenticate);

// Ingest single telemetry record
router.post(
  '/ingest',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = telemetryInputSchema.parse(req.body);
    const telemetry = await telemetryService.ingest(input);
    res.status(201).json(telemetry);
  })
);

// Batch ingest telemetry
router.post(
  '/ingest/batch',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { data } = batchInputSchema.parse(req.body);
    const count = await telemetryService.batchIngest(data);
    res.status(201).json({ ingested: count });
  })
);

// Get latest telemetry for a device
router.get(
  '/device/:deviceId/latest',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const telemetry = await telemetryService.getLatest(req.params.deviceId);
    res.json(telemetry);
  })
);

// Get telemetry history for a device
router.get(
  '/device/:deviceId/history',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = historyQuerySchema.parse(req.query);
    const telemetry = await telemetryService.getHistory(
      req.params.deviceId,
      query.startTime,
      query.endTime,
      query.limit
    );
    res.json(telemetry);
  })
);

// Get aggregated telemetry
router.get(
  '/device/:deviceId/aggregated',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = aggregateQuerySchema.parse(req.query);
    const aggregates = await telemetryService.getAggregated(
      req.params.deviceId,
      query.period,
      query.startTime,
      query.endTime
    );
    res.json(aggregates);
  })
);

// Get dashboard metrics
router.get(
  '/dashboard',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const metrics = await telemetryService.getDashboardMetrics(req.user!.organizationId);
    res.json(metrics);
  })
);

export default router;
