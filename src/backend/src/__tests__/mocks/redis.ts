export const cacheMock = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  invalidatePattern: jest.fn().mockResolvedValue(undefined),
};

export const pubsubMock = {
  publish: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn(),
};

export const keysMock = {
  device: (id: string) => `device:${id}`,
  deviceList: (orgId: string) => `devices:org:${orgId}`,
  telemetry: (deviceId: string) => `telemetry:${deviceId}:latest`,
  session: (token: string) => `session:${token}`,
};

jest.mock('../../utils/redis', () => ({
  cache: cacheMock,
  pubsub: pubsubMock,
  keys: keysMock,
  redis: {
    quit: jest.fn(),
  },
  redisPub: {
    quit: jest.fn(),
  },
  redisSub: {
    quit: jest.fn(),
  },
}));
