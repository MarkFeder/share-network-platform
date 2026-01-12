import { PrismaClient, TelemetryData, Prisma } from '@prisma/client';
import { cache, keys, pubsub } from '../utils/redis.js';
import { createContextLogger } from '../utils/logger.js';
import { TelemetryInput, AlertType, AlertSeverity } from '../types/index.js';

const logger = createContextLogger('TelemetryService');
const prisma = new PrismaClient();

const CACHE_TTL = 60; // 1 minute for telemetry

// Alert thresholds
const THRESHOLDS = {
  latencyMs: { warning: 100, critical: 500 },
  packetLoss: { warning: 1, critical: 5 },
  cpuUsage: { warning: 80, critical: 95 },
  memoryUsage: { warning: 85, critical: 95 },
  signalStrength: { warning: -70, critical: -80 },
};

export const telemetryService = {
  async ingest(input: TelemetryInput): Promise<TelemetryData> {
    const telemetry = await prisma.telemetryData.create({
      data: {
        deviceId: input.deviceId,
        latencyMs: input.latencyMs,
        jitterMs: input.jitterMs,
        packetLoss: input.packetLoss,
        bandwidthUp: input.bandwidthUp,
        bandwidthDown: input.bandwidthDown,
        cpuUsage: input.cpuUsage,
        memoryUsage: input.memoryUsage,
        diskUsage: input.diskUsage,
        temperature: input.temperature,
        signalStrength: input.signalStrength,
        connectedClients: input.connectedClients,
        metadata: input.metadata as Prisma.JsonObject,
      },
    });

    // Update cache with latest telemetry
    await cache.set(keys.telemetry(input.deviceId), telemetry, CACHE_TTL);

    // Publish event
    await pubsub.publish('telemetry:events', {
      type: 'telemetry:received',
      payload: telemetry,
      deviceId: input.deviceId,
    });

    // Check thresholds and create alerts
    await this.checkThresholds(input);

    return telemetry;
  },

  async batchIngest(inputs: TelemetryInput[]): Promise<number> {
    if (inputs.length > 1000) {
      throw new Error('Batch size exceeds maximum of 1000 records');
    }

    const result = await prisma.telemetryData.createMany({
      data: inputs.map((input) => ({
        deviceId: input.deviceId,
        latencyMs: input.latencyMs,
        jitterMs: input.jitterMs,
        packetLoss: input.packetLoss,
        bandwidthUp: input.bandwidthUp,
        bandwidthDown: input.bandwidthDown,
        cpuUsage: input.cpuUsage,
        memoryUsage: input.memoryUsage,
        diskUsage: input.diskUsage,
        temperature: input.temperature,
        signalStrength: input.signalStrength,
        connectedClients: input.connectedClients,
        metadata: input.metadata as Prisma.JsonObject,
      })),
    });

    logger.info('Batch telemetry ingested', { count: result.count });
    return result.count;
  },

  async getLatest(deviceId: string): Promise<TelemetryData | null> {
    const cached = await cache.get<TelemetryData>(keys.telemetry(deviceId));
    if (cached) return cached;

    const telemetry = await prisma.telemetryData.findFirst({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
    });

    if (telemetry) {
      await cache.set(keys.telemetry(deviceId), telemetry, CACHE_TTL);
    }

    return telemetry;
  },

  async getHistory(
    deviceId: string,
    startTime: Date,
    endTime: Date,
    limit = 1000
  ): Promise<TelemetryData[]> {
    return prisma.telemetryData.findMany({
      where: {
        deviceId,
        timestamp: { gte: startTime, lte: endTime },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  },

  async getAggregated(
    deviceId: string,
    period: 'hourly' | 'daily',
    startTime: Date,
    endTime: Date
  ) {
    return prisma.telemetryAggregate.findMany({
      where: {
        deviceId,
        period,
        timestamp: { gte: startTime, lte: endTime },
      },
      orderBy: { timestamp: 'asc' },
    });
  },

  async createAggregates(deviceId: string, period: 'hourly' | 'daily'): Promise<void> {
    const now = new Date();
    const periodMs = period === 'hourly' ? 3600000 : 86400000;
    const startTime = new Date(now.getTime() - periodMs);

    const data = await prisma.telemetryData.findMany({
      where: {
        deviceId,
        timestamp: { gte: startTime, lte: now },
      },
    });

    if (data.length === 0) return;

    const aggregate = {
      deviceId,
      period,
      timestamp: startTime,
      avgLatency: avg(data.map((d) => d.latencyMs)),
      maxLatency: max(data.map((d) => d.latencyMs)),
      minLatency: min(data.map((d) => d.latencyMs)),
      avgPacketLoss: avg(data.map((d) => d.packetLoss)),
      avgBandwidthUp: avg(data.map((d) => d.bandwidthUp)),
      avgBandwidthDown: avg(data.map((d) => d.bandwidthDown)),
      avgCpuUsage: avg(data.map((d) => d.cpuUsage)),
      avgMemoryUsage: avg(data.map((d) => d.memoryUsage)),
      sampleCount: data.length,
    };

    await prisma.telemetryAggregate.upsert({
      where: {
        deviceId_period_timestamp: {
          deviceId,
          period,
          timestamp: startTime,
        },
      },
      create: aggregate,
      update: aggregate,
    });

    logger.debug('Created telemetry aggregate', { deviceId, period });
  },

  async getDashboardMetrics(organizationId: string) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    const devices = await prisma.networkDevice.findMany({
      where: { organizationId },
      select: { id: true },
    });

    const deviceIds = devices.map((d) => d.id);

    const [latestTelemetry, alertCounts] = await Promise.all([
      prisma.telemetryData.findMany({
        where: {
          deviceId: { in: deviceIds },
          timestamp: { gte: oneHourAgo },
        },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.alert.groupBy({
        by: ['severity'],
        where: {
          organizationId,
          resolvedAt: null,
        },
        _count: true,
      }),
    ]);

    const avgLatency = avg(latestTelemetry.map((t) => t.latencyMs)) ?? 0;
    const avgPacketLoss = avg(latestTelemetry.map((t) => t.packetLoss)) ?? 0;
    const totalBandwidthUp = sum(latestTelemetry.map((t) => t.bandwidthUp)) ?? 0;
    const totalBandwidthDown = sum(latestTelemetry.map((t) => t.bandwidthDown)) ?? 0;

    return {
      avgLatency,
      avgPacketLoss,
      totalBandwidth: { up: totalBandwidthUp, down: totalBandwidthDown },
      alertCounts: Object.fromEntries(alertCounts.map((a) => [a.severity, a._count])),
      dataPoints: latestTelemetry.length,
    };
  },

  async checkThresholds(input: TelemetryInput): Promise<void> {
    const device = await prisma.networkDevice.findUnique({
      where: { id: input.deviceId },
    });

    if (!device) return;

    const alerts: Array<{ type: AlertType; severity: AlertSeverity; message: string }> = [];

    if (input.latencyMs !== undefined) {
      if (input.latencyMs >= THRESHOLDS.latencyMs.critical) {
        alerts.push({
          type: AlertType.HIGH_LATENCY,
          severity: AlertSeverity.CRITICAL,
          message: `Critical latency: ${input.latencyMs}ms`,
        });
      } else if (input.latencyMs >= THRESHOLDS.latencyMs.warning) {
        alerts.push({
          type: AlertType.HIGH_LATENCY,
          severity: AlertSeverity.HIGH,
          message: `High latency: ${input.latencyMs}ms`,
        });
      }
    }

    if (input.packetLoss !== undefined) {
      if (input.packetLoss >= THRESHOLDS.packetLoss.critical) {
        alerts.push({
          type: AlertType.PACKET_LOSS,
          severity: AlertSeverity.CRITICAL,
          message: `Critical packet loss: ${input.packetLoss}%`,
        });
      } else if (input.packetLoss >= THRESHOLDS.packetLoss.warning) {
        alerts.push({
          type: AlertType.PACKET_LOSS,
          severity: AlertSeverity.HIGH,
          message: `High packet loss: ${input.packetLoss}%`,
        });
      }
    }

    if (input.cpuUsage !== undefined && input.cpuUsage >= THRESHOLDS.cpuUsage.critical) {
      alerts.push({
        type: AlertType.HIGH_CPU,
        severity: AlertSeverity.CRITICAL,
        message: `Critical CPU usage: ${input.cpuUsage}%`,
      });
    }

    for (const alert of alerts) {
      await prisma.alert.create({
        data: {
          type: alert.type,
          severity: alert.severity,
          title: `${alert.type} on ${device.name}`,
          message: alert.message,
          deviceId: device.id,
          organizationId: device.organizationId,
        },
      });

      await pubsub.publish('alert:events', {
        type: 'alert:created',
        payload: alert,
        deviceId: device.id,
        organizationId: device.organizationId,
      });
    }
  },
};

// Helper functions
function avg(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

function sum(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) : null;
}

function max(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  return nums.length > 0 ? Math.max(...nums) : null;
}

function min(values: (number | null)[]): number | null {
  const nums = values.filter((v): v is number => v !== null);
  return nums.length > 0 ? Math.min(...nums) : null;
}
