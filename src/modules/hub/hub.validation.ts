import { z } from 'zod';

export const createZoneSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    region: z.string().min(2),
  }),
});

export const createHubSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    address: z.string().min(3),
    zoneId: z.string().uuid(),
  }),
});