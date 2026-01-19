import { http, HttpResponse } from 'msw';
import { mockDevices, mockStats, mockMetrics, mockAlerts } from '../fixtures/mockData';

const API_BASE = '/api/v1';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    // Simulate successful login for specific credentials
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        user: { id: '1', email: body.email, name: 'Test User', role: 'ADMIN' },
        tokens: { accessToken: 'test-token', refreshToken: 'test-refresh' },
      });
    }

    // Simulate failed login
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  // Device endpoints
  http.get(`${API_BASE}/devices`, () => {
    return HttpResponse.json({
      data: mockDevices,
      pagination: { page: 1, limit: 20, total: mockDevices.length, totalPages: 1 },
    });
  }),

  http.get(`${API_BASE}/devices/stats`, () => {
    return HttpResponse.json(mockStats);
  }),

  http.get(`${API_BASE}/devices/topology`, () => {
    return HttpResponse.json({
      nodes: mockDevices.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        status: d.status,
        position: null,
      })),
      edges: [],
    });
  }),

  http.get(`${API_BASE}/devices/:id`, ({ params }) => {
    const device = mockDevices.find(d => d.id === params.id);
    if (!device) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json(device);
  }),

  http.post(`${API_BASE}/devices`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-device-id',
      ...body,
      status: 'UNKNOWN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Telemetry endpoints
  http.get(`${API_BASE}/telemetry/dashboard`, () => {
    return HttpResponse.json(mockMetrics);
  }),

  http.get(`${API_BASE}/telemetry/device/:deviceId/latest`, ({ params }) => {
    return HttpResponse.json({
      id: 'telemetry-1',
      deviceId: params.deviceId,
      latencyMs: 45,
      jitterMs: 5,
      packetLoss: 0.1,
      bandwidthUp: 100,
      bandwidthDown: 500,
      cpuUsage: 35,
      memoryUsage: 60,
      temperature: 42,
      signalStrength: -65,
      timestamp: new Date().toISOString(),
    });
  }),

  http.get(`${API_BASE}/telemetry/device/:deviceId/history`, () => {
    return HttpResponse.json({
      data: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });
  }),

  // Alert endpoints
  http.get(`${API_BASE}/alerts`, () => {
    return HttpResponse.json({
      data: mockAlerts,
      pagination: { page: 1, limit: 20, total: mockAlerts.length, totalPages: 1 },
    });
  }),

  http.patch(`${API_BASE}/alerts/:id/acknowledge`, ({ params }) => {
    const alert = mockAlerts.find(a => a.id === params.id);
    if (!alert) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return HttpResponse.json({ ...alert, acknowledgedAt: new Date().toISOString() });
  }),

  // Health endpoints
  http.get('/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),

  http.get('/health/detailed', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
      },
    });
  }),
];
