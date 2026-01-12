import Redis from 'ioredis';
import { config } from '../config/index.js';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('Redis');

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export const redisPub = new Redis(config.redis.url);
export const redisSub = new Redis(config.redis.url);

redis.on('connect', () => logger.info('Connected to Redis'));
redis.on('error', (err) => logger.error('Redis error', err));

// Cache helpers
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, data);
    } else {
      await redis.set(key, data);
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Pub/Sub helpers
export const pubsub = {
  async publish(channel: string, message: unknown): Promise<void> {
    await redisPub.publish(channel, JSON.stringify(message));
  },

  subscribe(channel: string, callback: (message: unknown) => void): void {
    redisSub.subscribe(channel);
    redisSub.on('message', (ch, msg) => {
      if (ch === channel) {
        callback(JSON.parse(msg));
      }
    });
  },
};

// Key generators
export const keys = {
  device: (id: string) => `device:${id}`,
  deviceList: (orgId: string) => `devices:org:${orgId}`,
  telemetry: (deviceId: string) => `telemetry:${deviceId}:latest`,
  session: (token: string) => `session:${token}`,
};

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  await Promise.all([redis.quit(), redisPub.quit(), redisSub.quit()]);
  logger.info('Redis connections closed');
};
