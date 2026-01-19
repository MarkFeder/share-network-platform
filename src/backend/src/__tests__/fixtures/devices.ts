import { DeviceType, DeviceStatus, DeviceInput } from '../../types';

let counter = 0;

const generateId = () => {
  counter++;
  return `test-id-${counter}-${Date.now()}`;
};

export const mockDeviceInput = (overrides?: Partial<DeviceInput>): DeviceInput => ({
  name: `Test Device ${generateId()}`,
  type: DeviceType.ROUTER,
  ipAddress: '192.168.1.1',
  macAddress: '00:11:22:33:44:55',
  firmwareVersion: '1.0.0',
  latitude: 40.7128,
  longitude: -74.006,
  locationName: 'Test Location',
  ...overrides,
});

export const mockDevice = (overrides?: Partial<Record<string, unknown>>) => ({
  id: generateId(),
  name: `Test Device ${counter}`,
  type: DeviceType.ROUTER,
  status: DeviceStatus.ONLINE,
  ipAddress: '192.168.1.1',
  macAddress: '00:11:22:33:44:55',
  firmwareVersion: '1.0.0',
  organizationId: 'org-123',
  parentDeviceId: null,
  latitude: null,
  longitude: null,
  locationName: null,
  metadata: null,
  config: null,
  lastSeenAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockJwtPayload = (overrides?: Partial<Record<string, unknown>>) => ({
  userId: generateId(),
  email: 'test@example.com',
  role: 'ADMIN' as const,
  organizationId: 'org-123',
  ...overrides,
});
