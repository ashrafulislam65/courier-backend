import { ShipmentStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { calculatePrice, assertValidTransition, generateTrackingCode } from './shipment.utils';

export const createShipment = async (
  customerId: string,
  data: {
    originHubId: string;
    destinationHubId: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    weightKg: number;
  }
) => {
  const [originHub, destHub] = await Promise.all([
    prisma.hub.findUnique({ where: { id: data.originHubId } }),
    prisma.hub.findUnique({ where: { id: data.destinationHubId } }),
  ]);
  if (!originHub) throw new AppError('Origin hub not found', 404);
  if (!destHub) throw new AppError('Destination hub not found', 404);

  const price = calculatePrice(data.weightKg);
  const trackingCode = generateTrackingCode();

  const shipment = await prisma.$transaction(async (tx) => {
    const created = await tx.shipment.create({
      data: {
        trackingCode,
        customerId,
        originHubId: data.originHubId,
        destinationHubId: data.destinationHubId,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        recipientAddress: data.recipientAddress,
        weightKg: data.weightKg,
        price,
        status: ShipmentStatus.CREATED,
      },
    });

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId: created.id,
        status: ShipmentStatus.CREATED,
        changedById: customerId,
        note: 'Shipment created',
      },
    });

    return created;
  });

  return shipment;
};

export const listShipments = async (
  filters: { status?: string; page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' },
  scope: { customerId?: string; courierId?: string }
) => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
  const skip = (page - 1) * limit;

  const where: any = { deletedAt: null };
  if (filters.status) where.status = filters.status;
  if (scope.customerId) where.customerId = scope.customerId;
  if (scope.courierId) where.courierId = scope.courierId;

  const orderBy = filters.sortBy
    ? { [filters.sortBy]: filters.sortOrder || 'desc' }
    : { createdAt: 'desc' as const };

  const [items, total] = await Promise.all([
    prisma.shipment.findMany({ where, skip, take: limit, orderBy }),
    prisma.shipment.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getShipmentById = async (id: string) => {
  const shipment = await prisma.shipment.findFirst({
    where: { id, deletedAt: null },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      courier: { select: { id: true, name: true, phone: true } },
      payment: true,
    },
  });
  if (!shipment) throw new AppError('Shipment not found', 404);
  return shipment;
};

export const searchShipmentByTrackingCode = async (code: string) => {
  const shipment = await prisma.shipment.findFirst({
    where: { trackingCode: { contains: code, mode: 'insensitive' }, deletedAt: null },
  });
  if (!shipment) throw new AppError('No shipment found with that tracking code', 404);
  return shipment;
};

export const getShipmentTracking = async (id: string) => {
  const history = await prisma.shipmentStatusHistory.findMany({
    where: { shipmentId: id },
    orderBy: { createdAt: 'asc' },
    include: { changedBy: { select: { name: true, role: true } } },
  });
  if (!history.length) throw new AppError('No tracking history found', 404);
  return history;
};

export const cancelShipment = async (id: string, customerId: string) => {
  const shipment = await prisma.shipment.findFirst({ where: { id, customerId, deletedAt: null } });
  if (!shipment) throw new AppError('Shipment not found', 404);
  if (!['CREATED', 'PICKUP_SCHEDULED'].includes(shipment.status)) {
    throw new AppError('Shipment can no longer be cancelled', 400);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.shipment.update({
      where: { id },
      data: { status: ShipmentStatus.CANCELLED },
    });
    await tx.shipmentStatusHistory.create({
      data: { shipmentId: id, status: ShipmentStatus.CANCELLED, changedById: customerId, note: 'Cancelled by customer' },
    });
    return updated;
  });
};

export const assignCourier = async (shipmentId: string, courierId: string, adminId: string) => {
  return prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment || shipment.deletedAt) throw new AppError('Shipment not found', 404);
    if (shipment.courierId) throw new AppError('Shipment already has a courier assigned', 400);

    const courierProfile = await tx.courierProfile.findUnique({ where: { userId: courierId } });
    if (!courierProfile) throw new AppError('Courier profile not found', 404);
    if (!courierProfile.isAvailable) throw new AppError('Courier is not available', 400);

    assertValidTransition(shipment.status, ShipmentStatus.COURIER_ASSIGNED);

    const updated = await tx.shipment.update({
      where: { id: shipmentId },
      data: { courierId, status: ShipmentStatus.COURIER_ASSIGNED },
    });

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId,
        status: ShipmentStatus.COURIER_ASSIGNED,
        changedById: adminId,
        note: `Courier assigned`,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ASSIGN_COURIER',
        targetType: 'Shipment',
        targetId: shipmentId,
        metadata: { courierId },
      },
    });

    return updated;
  });
};

export const updateShipmentStatus = async (
  shipmentId: string,
  newStatus: ShipmentStatus,
  actorId: string,
  note?: string
) => {
  return prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment || shipment.deletedAt) throw new AppError('Shipment not found', 404);

    assertValidTransition(shipment.status, newStatus);

    const updated = await tx.shipment.update({
      where: { id: shipmentId },
      data: { status: newStatus },
    });

    await tx.shipmentStatusHistory.create({
      data: { shipmentId, status: newStatus, changedById: actorId, note },
    });

    return updated;
  });
};

export const transferHub = async (shipmentId: string, toHubId: string, actorId: string) => {
  return prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.findUnique({ where: { id: shipmentId } });
    if (!shipment || shipment.deletedAt) throw new AppError('Shipment not found', 404);

    const toHub = await tx.hub.findUnique({ where: { id: toHubId } });
    if (!toHub) throw new AppError('Destination hub not found', 404);

    await tx.hubTransferLog.create({
      data: { shipmentId, fromHubId: shipment.destinationHubId, toHubId },
    });

    const updated = await tx.shipment.update({
      where: { id: shipmentId },
      data: { status: ShipmentStatus.AT_DESTINATION_HUB },
    });

    await tx.shipmentStatusHistory.create({
      data: {
        shipmentId,
        status: ShipmentStatus.AT_DESTINATION_HUB,
        changedById: actorId,
        note: `Transferred to hub ${toHub.name}`,
      },
    });

    return updated;
  });
};