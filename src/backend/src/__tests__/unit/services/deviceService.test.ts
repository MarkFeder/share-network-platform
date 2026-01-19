import '../../../__tests__/mocks/redis';
import { prismaMock } from '../../mocks/prisma';
import { cacheMock, pubsubMock } from '../../mocks/redis';
import { mockDevice, mockDeviceInput } from '../../fixtures/devices';
import { DeviceStatus, DeviceType } from '../../../types';

// Import after mocks are set up
import { deviceService } from '../../../services/deviceService';

describe('DeviceService', () => {
  const organizationId = 'org-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a device with correct data', async () => {
      const input = mockDeviceInput({ name: 'Test Router', type: DeviceType.ROUTER });
      const expectedDevice = mockDevice({ ...input, organizationId });

      prismaMock.networkDevice.create.mockResolvedValue(expectedDevice as never);

      const result = await deviceService.create(organizationId, input);

      expect(prismaMock.networkDevice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: input.name,
          type: input.type,
          organizationId,
          status: DeviceStatus.UNKNOWN,
        }),
      });
      expect(result).toEqual(expectedDevice);
    });

    it('should invalidate cache after creation', async () => {
      const input = mockDeviceInput();
      const device = mockDevice({ organizationId });

      prismaMock.networkDevice.create.mockResolvedValue(device as never);

      await deviceService.create(organizationId, input);

      expect(cacheMock.invalidatePattern).toHaveBeenCalledWith(
        expect.stringContaining(organizationId)
      );
    });

    it('should publish device:registered event', async () => {
      const input = mockDeviceInput();
      const device = mockDevice({ organizationId });

      prismaMock.networkDevice.create.mockResolvedValue(device as never);

      await deviceService.create(organizationId, input);

      expect(pubsubMock.publish).toHaveBeenCalledWith('device:events', {
        type: 'device:registered',
        payload: { device },
        organizationId,
      });
    });
  });

  describe('getById', () => {
    it('should return cached device if available and org matches', async () => {
      const device = mockDevice({ organizationId });
      cacheMock.get.mockResolvedValue(device);

      const result = await deviceService.getById(device.id, organizationId);

      expect(result).toEqual(device);
      expect(prismaMock.networkDevice.findFirst).not.toHaveBeenCalled();
    });

    it('should fetch from database when cache miss', async () => {
      const device = mockDevice({ organizationId });
      cacheMock.get.mockResolvedValue(null);
      prismaMock.networkDevice.findFirst.mockResolvedValue(device as never);

      const result = await deviceService.getById(device.id, organizationId);

      expect(prismaMock.networkDevice.findFirst).toHaveBeenCalledWith({
        where: { id: device.id, organizationId },
        include: { childDevices: true },
      });
      expect(result).toEqual(device);
    });

    it('should cache device after fetching from database', async () => {
      const device = mockDevice({ organizationId });
      cacheMock.get.mockResolvedValue(null);
      prismaMock.networkDevice.findFirst.mockResolvedValue(device as never);

      await deviceService.getById(device.id, organizationId);

      expect(cacheMock.set).toHaveBeenCalledWith(
        expect.stringContaining(device.id),
        device,
        300
      );
    });

    it('should not use cached device if organizationId does not match', async () => {
      const device = mockDevice({ organizationId: 'different-org' });
      cacheMock.get.mockResolvedValue(device);
      prismaMock.networkDevice.findFirst.mockResolvedValue(null as never);

      const result = await deviceService.getById(device.id, organizationId);

      expect(prismaMock.networkDevice.findFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when device not found', async () => {
      cacheMock.get.mockResolvedValue(null);
      prismaMock.networkDevice.findFirst.mockResolvedValue(null as never);

      const result = await deviceService.getById('non-existent', organizationId);

      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('should return paginated devices', async () => {
      const devices = [mockDevice(), mockDevice()];
      prismaMock.networkDevice.findMany.mockResolvedValue(devices as never);
      prismaMock.networkDevice.count.mockResolvedValue(2);

      const result = await deviceService.list(organizationId, {
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: devices,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should apply type filter when provided', async () => {
      prismaMock.networkDevice.findMany.mockResolvedValue([]);
      prismaMock.networkDevice.count.mockResolvedValue(0);

      await deviceService.list(organizationId, {
        page: 1,
        limit: 20,
        type: DeviceType.ROUTER,
      });

      expect(prismaMock.networkDevice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: DeviceType.ROUTER }),
        })
      );
    });

    it('should apply status filter when provided', async () => {
      prismaMock.networkDevice.findMany.mockResolvedValue([]);
      prismaMock.networkDevice.count.mockResolvedValue(0);

      await deviceService.list(organizationId, {
        page: 1,
        limit: 20,
        status: DeviceStatus.ONLINE,
      });

      expect(prismaMock.networkDevice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: DeviceStatus.ONLINE }),
        })
      );
    });

    it('should calculate correct skip value for pagination', async () => {
      prismaMock.networkDevice.findMany.mockResolvedValue([]);
      prismaMock.networkDevice.count.mockResolvedValue(0);

      await deviceService.list(organizationId, {
        page: 3,
        limit: 10,
      });

      expect(prismaMock.networkDevice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });
  });

  describe('update', () => {
    it('should update device with provided data', async () => {
      const device = mockDevice({ organizationId });
      prismaMock.networkDevice.update.mockResolvedValue(device as never);

      const result = await deviceService.update(device.id, organizationId, {
        name: 'Updated Name',
      });

      expect(prismaMock.networkDevice.update).toHaveBeenCalledWith({
        where: { id: device.id },
        data: expect.objectContaining({ name: 'Updated Name' }),
      });
      expect(result).toEqual(device);
    });

    it('should invalidate cache after update', async () => {
      const device = mockDevice({ organizationId });
      prismaMock.networkDevice.update.mockResolvedValue(device as never);

      await deviceService.update(device.id, organizationId, { name: 'New Name' });

      expect(cacheMock.del).toHaveBeenCalledWith(expect.stringContaining(device.id));
      expect(cacheMock.invalidatePattern).toHaveBeenCalled();
    });

    it('should publish device:updated event', async () => {
      const device = mockDevice({ organizationId });
      prismaMock.networkDevice.update.mockResolvedValue(device as never);

      await deviceService.update(device.id, organizationId, { name: 'New Name' });

      expect(pubsubMock.publish).toHaveBeenCalledWith('device:events', {
        type: 'device:updated',
        payload: { device },
        organizationId,
      });
    });
  });

  describe('delete', () => {
    it('should delete device', async () => {
      prismaMock.networkDevice.delete.mockResolvedValue({} as never);

      await deviceService.delete('device-123', organizationId);

      expect(prismaMock.networkDevice.delete).toHaveBeenCalledWith({
        where: { id: 'device-123' },
      });
    });

    it('should invalidate cache after deletion', async () => {
      prismaMock.networkDevice.delete.mockResolvedValue({} as never);

      await deviceService.delete('device-123', organizationId);

      expect(cacheMock.del).toHaveBeenCalledWith(expect.stringContaining('device-123'));
      expect(cacheMock.invalidatePattern).toHaveBeenCalled();
    });

    it('should publish device:deleted event', async () => {
      prismaMock.networkDevice.delete.mockResolvedValue({} as never);

      await deviceService.delete('device-123', organizationId);

      expect(pubsubMock.publish).toHaveBeenCalledWith('device:events', {
        type: 'device:deleted',
        payload: { deviceId: 'device-123' },
        organizationId,
      });
    });
  });

  describe('getStats', () => {
    it('should return aggregated device stats', async () => {
      prismaMock.networkDevice.groupBy.mockResolvedValue([
        { status: DeviceStatus.ONLINE, type: DeviceType.ROUTER, _count: 5 },
        { status: DeviceStatus.OFFLINE, type: DeviceType.SWITCH, _count: 2 },
      ] as never);

      const result = await deviceService.getStats(organizationId);

      expect(result.total).toBe(7);
      expect(result.byStatus[DeviceStatus.ONLINE]).toBe(5);
      expect(result.byStatus[DeviceStatus.OFFLINE]).toBe(2);
      expect(result.byType[DeviceType.ROUTER]).toBe(5);
      expect(result.byType[DeviceType.SWITCH]).toBe(2);
    });

    it('should initialize all status and type counts to zero', async () => {
      prismaMock.networkDevice.groupBy.mockResolvedValue([] as never);

      const result = await deviceService.getStats(organizationId);

      expect(result.total).toBe(0);
      Object.values(DeviceStatus).forEach((status) => {
        expect(result.byStatus[status]).toBe(0);
      });
      Object.values(DeviceType).forEach((type) => {
        expect(result.byType[type]).toBe(0);
      });
    });
  });

  describe('getTopology', () => {
    it('should return nodes and edges for network topology', async () => {
      const devices = [
        {
          id: 'device-1',
          name: 'Router',
          type: DeviceType.ROUTER,
          status: DeviceStatus.ONLINE,
          parentDeviceId: null,
          latitude: 40.7128,
          longitude: -74.006,
        },
        {
          id: 'device-2',
          name: 'Switch',
          type: DeviceType.SWITCH,
          status: DeviceStatus.ONLINE,
          parentDeviceId: 'device-1',
          latitude: null,
          longitude: null,
        },
      ];

      prismaMock.networkDevice.findMany.mockResolvedValue(devices as never);

      const result = await deviceService.getTopology(organizationId);

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0]).toMatchObject({
        id: 'device-1',
        name: 'Router',
        type: DeviceType.ROUTER,
        status: DeviceStatus.ONLINE,
        position: { lat: 40.7128, lng: -74.006 },
      });
      expect(result.nodes[1].position).toBeNull();
    });

    it('should create edges for parent-child relationships', async () => {
      const devices = [
        { id: 'parent', name: 'Parent', type: DeviceType.ROUTER, status: DeviceStatus.ONLINE, parentDeviceId: null, latitude: null, longitude: null },
        { id: 'child', name: 'Child', type: DeviceType.SWITCH, status: DeviceStatus.ONLINE, parentDeviceId: 'parent', latitude: null, longitude: null },
      ];

      prismaMock.networkDevice.findMany.mockResolvedValue(devices as never);

      const result = await deviceService.getTopology(organizationId);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual({ source: 'parent', target: 'child' });
    });
  });

  describe('updateStatus', () => {
    it('should update device status', async () => {
      const device = mockDevice({ status: DeviceStatus.ONLINE });
      prismaMock.networkDevice.update.mockResolvedValue(device as never);

      const result = await deviceService.updateStatus('device-123', DeviceStatus.ONLINE);

      expect(prismaMock.networkDevice.update).toHaveBeenCalledWith({
        where: { id: 'device-123' },
        data: expect.objectContaining({ status: DeviceStatus.ONLINE }),
      });
      expect(result).toEqual(device);
    });

    it('should set lastSeenAt when status is ONLINE', async () => {
      const device = mockDevice({ status: DeviceStatus.ONLINE });
      prismaMock.networkDevice.update.mockResolvedValue(device as never);

      await deviceService.updateStatus('device-123', DeviceStatus.ONLINE);

      expect(prismaMock.networkDevice.update).toHaveBeenCalledWith({
        where: { id: 'device-123' },
        data: expect.objectContaining({ lastSeenAt: expect.any(Date) }),
      });
    });

    it('should publish device:status_changed event', async () => {
      const device = mockDevice({ organizationId });
      prismaMock.networkDevice.update.mockResolvedValue(device as never);

      await deviceService.updateStatus('device-123', DeviceStatus.OFFLINE);

      expect(pubsubMock.publish).toHaveBeenCalledWith('device:events', {
        type: 'device:status_changed',
        payload: { deviceId: 'device-123', status: DeviceStatus.OFFLINE },
        organizationId: device.organizationId,
      });
    });
  });
});
