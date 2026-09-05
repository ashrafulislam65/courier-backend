import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      courierProfile: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateMe = async (userId: string, data: { name?: string; phone?: string }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  return user;
};