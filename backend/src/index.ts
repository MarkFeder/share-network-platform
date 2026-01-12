import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { collectDefaultMetrics, Registry, Counter, Histogram } from 'prom-client';

import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { redis, redisSub, closeRedis } from './utils/redis.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './api/health.js';
import deviceRoutes from './api/devices.js';
import telemetryRoutes from './api/telemetry.js';

// Initialize Express
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
  },
});

// Prometheus metrics
const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: '10mb' }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests' },
  })
);

// Request metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ method: req.method, path: req.route?.path || req.path, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, path: req.route?.path || req.path }, duration);
  });
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);

// Prometheus metrics endpoint
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Error handler
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('subscribe:devices', (organizationId: string) => {
    socket.join(`org:${organizationId}:devices`);
  });

  socket.on('subscribe:telemetry', (deviceId: string) => {
    socket.join(`device:${deviceId}:telemetry`);
  });

  socket.on('subscribe:alerts', (organizationId: string) => {
    socket.join(`org:${organizationId}:alerts`);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Redis pub/sub for real-time events
redisSub.subscribe('device:events', 'telemetry:events', 'alert:events');
redisSub.on('message', (channel, message) => {
  try {
    const event = JSON.parse(message);

    switch (channel) {
      case 'device:events':
        io.to(`org:${event.organizationId}:devices`).emit('device:update', event);
        break;
      case 'telemetry:events':
        io.to(`device:${event.deviceId}:telemetry`).emit('telemetry:update', event);
        break;
      case 'alert:events':
        io.to(`org:${event.organizationId}:alerts`).emit('alert:update', event);
        break;
    }
  } catch (error) {
    logger.error('Failed to process pub/sub message', error);
  }
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down...');

  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  io.close(() => {
    logger.info('Socket.IO server closed');
  });

  await closeRedis();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const start = async () => {
  try {
    await redis.connect();
    logger.info('Connected to Redis');

    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, { env: config.env });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
