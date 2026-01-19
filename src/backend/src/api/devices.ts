import { Router, Response } from 'express';
import { z } from 'zod';
import { deviceService } from '../services/deviceService.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest, DeviceType, DeviceStatus, UserRole } from '../types/index.js';

const router = Router();

// Validation schemas
const createDeviceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.nativeEnum(DeviceType),
  ipAddress: z.string().ip().optional(),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/).optional(),
  firmwareVersion: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationName: z.string().optional(),
  parentDeviceId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
  config: z.record(z.unknown()).optional(),
});

const updateDeviceSchema = createDeviceSchema.partial();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  type: z.nativeEnum(DeviceType).optional(),
  status: z.nativeEnum(DeviceStatus).optional(),
});

// Routes
router.use(authenticate);

// List devices
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const result = await deviceService.list(req.user!.organizationId, query);
    res.json(result);
  })
);

// Get device stats
router.get(
  '/stats',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await deviceService.getStats(req.user!.organizationId);
    res.json(stats);
  })
);

// Get network topology
router.get(
  '/topology',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const topology = await deviceService.getTopology(req.user!.organizationId);
    res.json(topology);
  })
);

// Get single device
router.get(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const device = await deviceService.getById(req.params.id, req.user!.organizationId);
    if (!device) throw new NotFoundError('Device');
    res.json(device);
  })
);

// Create device
router.post(
  '/',
  authorize(UserRole.ADMIN, UserRole.OPERATOR),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = createDeviceSchema.parse(req.body);
    const device = await deviceService.create(req.user!.organizationId, input);
    res.status(201).json(device);
  })
);

// Update device
router.put(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.OPERATOR),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const input = updateDeviceSchema.parse(req.body);
    const device = await deviceService.update(req.params.id, req.user!.organizationId, input);
    res.json(device);
  })
);

// Delete device
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await deviceService.delete(req.params.id, req.user!.organizationId);
    res.status(204).send();
  })
);

// Update device status (heartbeat)
router.post(
  '/:id/heartbeat',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const device = await deviceService.updateStatus(req.params.id, DeviceStatus.ONLINE);
    res.json(device);
  })
);

export default router;
