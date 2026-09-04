import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';

export const setAvailability = async (userId: string, isAvailable: boolean) => {
  const profile = await prisma.courierProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError('Courier profile not found', 404);
  return prisma.courierProfile.update({ where: { userId }, data: { isAvailable } });
};

export const getMyAssignedShipments = async (courierId: string) => {
  return prisma.shipment.findMany({
    where: { courierId, deletedAt: null, status: { notIn: ['DELIVERED', 'CANCELLED', 'RETURN_TO_SENDER'] } },
    orderBy: { createdAt: 'desc' },
  });
};

export const getMyEarnings = async (courierId: string) => {
  const profile = await prisma.courierProfile.findUnique({ where: { userId: courierId } });
  if (!profile) throw new AppError('Courier profile not found', 404);

  const deliveredCount = await prisma.shipment.count({
    where: { courierId, status: 'DELIVERED' },
  });

  return { totalEarnings: profile.totalEarnings, deliveredCount };
};