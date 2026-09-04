import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';

export const listUsers = async (filters: { role?: string; page?: number; limit?: number }) => {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
  const skip = (page - 1) * limit;

  const where: any = { deletedAt: null };
  if (filters.role) where.role = filters.role;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: { id: true, name: true, email: true, role: true, isBlocked: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const updateUserRole = async (userId: string, role: 'CUSTOMER' | 'COURIER' | 'ADMIN', adminId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const updated = await prisma.user.update({ where: { id: userId }, data: { role } });

  await prisma.auditLog.create({
    data: { actorId: adminId, action: 'UPDATE_USER_ROLE', targetType: 'User', targetId: userId, metadata: { newRole: role } },
  });

  return updated;
};

export const toggleBlockUser = async (userId: string, isBlocked: boolean, adminId: string) => {
  const updated = await prisma.user.update({ where: { id: userId }, data: { isBlocked } });

  await prisma.auditLog.create({
    data: { actorId: adminId, action: isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER', targetType: 'User', targetId: userId },
  });

  return updated;
};

export const getDashboardStats = async () => {
  const [totalShipments, deliveredShipments, activeShipments, totalUsers, totalCouriers, totalRevenueAgg] =
    await Promise.all([
      prisma.shipment.count({ where: { deletedAt: null } }),
      prisma.shipment.count({ where: { status: 'DELIVERED' } }),
      prisma.shipment.count({
        where: { status: { notIn: ['DELIVERED', 'CANCELLED', 'RETURN_TO_SENDER'] }, deletedAt: null },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
      prisma.user.count({ where: { role: 'COURIER', deletedAt: null } }),
      prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
    ]);

  return {
    totalShipments,
    deliveredShipments,
    activeShipments,
    totalUsers,
    totalCouriers,
    totalRevenue: totalRevenueAgg._sum.amount || 0,
  };
};

export const getAuditLogs = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { name: true, role: true } } },
    }),
    prisma.auditLog.count(),
  ]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};