import { Prisma } from '@prisma/client';
import type { NetworkDevice } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { cache, keys, pubsub } from '../utils/redis.js';
import { createContextLogger } from '../utils/logger.js';
import { CACHE_TTL, CHANNELS, EVENT_TYPES } from '../config/constants.js';
import {
  DeviceInput,
  DeviceStatus,
  DeviceType,
  DeviceStats,
  PaginationParams,
  PaginatedResponse,
} from '../types/index.js';

const logger = createContextLogger('DeviceService');

async function invalidateDeviceCache(id: string, orgId: string) {
  await cache.del(keys.device(id));
  await cache.invalidatePattern(keys.deviceList(orgId) + '*');
}

async function publishDeviceEvent(type: string, payload: Record<string, unknown>, orgId: string) {
  await pubsub.publish(CHANNELS.DEVICE_EVENTS, { type, payload, organizationId: orgId });
}

export const deviceService = {
  async create(organizationId: string, input: DeviceInput): Promise<NetworkDevice> {
    const { metadata, config, ...rest } = input;
    const device = await prisma.networkDevice.create({
      data: {
        ...rest,
        organizationId,
        status: DeviceStatus.UNKNOWN,
        metadata: metadata as Prisma.InputJsonValue,
        config: config as Prisma.InputJsonValue,
      },
    });

    await invalidateDeviceCache(device.id, organizationId);
    await publishDeviceEvent(EVENT_TYPES.DEVICE_REGISTERED, { device }, organizationId);

    logger.info('Device created', { deviceId: device.id, name: device.name });
    return device;
  },

  async getById(id: string, organizationId: string): Promise<NetworkDevice | null> {
    const cacheKey = keys.device(id);
    const cached = await cache.get<NetworkDevice>(cacheKey);

    if (cached && cached.organizationId === organizationId) {
      return cached;
    }

    const device = await prisma.networkDevice.findFirst({
      where: { id, organizationId },
      include: { childDevices: true },
    });

    if (device) {
      await cache.set(cacheKey, device, CACHE_TTL.DEVICE);
    }

    return device;
  },

  async list(
    organizationId: string,
    params: PaginationParams & { type?: DeviceType; status?: DeviceStatus; search?: string }
  ): Promise<PaginatedResponse<NetworkDevice>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc', type, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.NetworkDeviceWhereInput = {
      organizationId,
      ...(type && { type }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { ipAddress: { contains: search } },
        ],
      }),
    };

    const [devices, total] = await Promise.all([
      prisma.networkDevice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { childDevices: { select: { id: true, name: true } } },
      }),
      prisma.networkDevice.count({ where }),
    ]);

    return {
      data: devices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async update(
    id: string,
    organizationId: string,
    input: Partial<DeviceInput>
  ): Promise<NetworkDevice> {
    const { metadata, config, ...rest } = input;
    const device = await prisma.networkDevice.update({
      where: { id },
      data: {
        ...rest,
        ...(metadata !== undefined && { metadata: metadata as Prisma.InputJsonValue }),
        ...(config !== undefined && { config: config as Prisma.InputJsonValue }),
      },
    });

    await invalidateDeviceCache(id, organizationId);
    await publishDeviceEvent(EVENT_TYPES.DEVICE_UPDATED, { device }, organizationId);

    logger.info('Device updated', { deviceId: id });
    return device;
  },

  async delete(id: string, organizationId: string): Promise<void> {
    await prisma.networkDevice.delete({ where: { id } });

    await invalidateDeviceCache(id, organizationId);
    await publishDeviceEvent(EVENT_TYPES.DEVICE_DELETED, { deviceId: id }, organizationId);

    logger.info('Device deleted', { deviceId: id });
  },

  async updateStatus(id: string, status: DeviceStatus): Promise<NetworkDevice> {
    const device = await prisma.networkDevice.update({
      where: { id },
      data: { status, lastSeenAt: status === DeviceStatus.ONLINE ? new Date() : undefined },
    });

    await invalidateDeviceCache(id, device.organizationId);
    await publishDeviceEvent(EVENT_TYPES.DEVICE_STATUS_CHANGED, { deviceId: id, status }, device.organizationId);

    return device;
  },

  async getStats(organizationId: string): Promise<DeviceStats> {
    const devices = await prisma.networkDevice.groupBy({
      by: ['status', 'type'],
      where: { organizationId },
      _count: true,
    });

    const stats: DeviceStats = {
      total: 0,
      byStatus: {} as Record<DeviceStatus, number>,
      byType: {} as Record<DeviceType, number>,
    };

    // Initialize all counts to zero
    for (const status of Object.values(DeviceStatus)) {
      stats.byStatus[status] = 0;
    }
    for (const type of Object.values(DeviceType)) {
      stats.byType[type] = 0;
    }

    // Aggregate counts
    for (const group of devices) {
      stats.total += group._count;
      stats.byStatus[group.status as DeviceStatus] += group._count;
      stats.byType[group.type as DeviceType] += group._count;
    }

    return stats;
  },

  async getTopology(organizationId: string) {
    const devices = await prisma.networkDevice.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        parentDeviceId: true,
        latitude: true,
        longitude: true,
      },
    });

    const nodes = devices.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      status: d.status,
      position: d.latitude && d.longitude ? { lat: d.latitude, lng: d.longitude } : null,
    }));

    const edges = devices
      .filter((d) => d.parentDeviceId)
      .map((d) => ({
        source: d.parentDeviceId!,
        target: d.id,
      }));

    return { nodes, edges };
  },
};
