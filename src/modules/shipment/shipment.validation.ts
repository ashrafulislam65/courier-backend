import { z } from 'zod';

export const createShipmentSchema = z.object({
  body: z.object({
    originHubId: z.string().uuid('Invalid origin hub id'),
    destinationHubId: z.string().uuid('Invalid destination hub id'),
    recipientName: z.string().min(2),
    recipientPhone: z.string().min(6),
    recipientAddress: z.string().min(5),
    weightKg: z.number().positive('Weight must be greater than 0'),
  }),
});

export const listShipmentsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const assignCourierSchema = z.object({
  body: z.object({
    courierId: z.string().uuid('Invalid courier id'),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'PICKUP_SCHEDULED',
      'PICKED_UP',
      'IN_TRANSIT',
      'AT_DESTINATION_HUB',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'FAILED',
      'RETURN_TO_SENDER',
    ]),
    note: z.string().optional(),
  }),
});

export const transferHubSchema = z.object({
  body: z.object({
    toHubId: z.string().uuid('Invalid destination hub id'),
  }),
});