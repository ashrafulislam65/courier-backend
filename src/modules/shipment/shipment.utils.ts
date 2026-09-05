import { ShipmentStatus } from '@prisma/client';
import { AppError } from '../../utils/appError';

export const calculatePrice = (weightKg: number): number => {
  const baseFee = 60;
  const perKgRate = 15;
  return Math.round(baseFee + weightKg * perKgRate);
};

export const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  CREATED: ['PICKUP_SCHEDULED', 'COURIER_ASSIGNED', 'CANCELLED'],
  PICKUP_SCHEDULED: ['COURIER_ASSIGNED', 'CANCELLED'],
  COURIER_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT: ['AT_DESTINATION_HUB', 'FAILED'],
  AT_DESTINATION_HUB: ['OUT_FOR_DELIVERY', 'FAILED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: ['RETURN_TO_SENDER', 'OUT_FOR_DELIVERY'],
  RETURN_TO_SENDER: [],
  CANCELLED: [],
};

export const assertValidTransition = (
  current: ShipmentStatus,
  next: ShipmentStatus
) => {
  const allowed = VALID_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new AppError(
      `Invalid status transition: cannot move from ${current} to ${next}`,
      400
    );
  }
};

export const generateTrackingCode = (): string => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CR-${Date.now().toString().slice(-6)}-${rand}`;
};