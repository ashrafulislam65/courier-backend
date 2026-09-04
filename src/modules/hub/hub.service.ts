import prisma from '../../config/prisma';

export const createZone = async (data: { name: string; region: string }) => {
  return prisma.zone.create({ data });
};

export const listZones = async () => {
  return prisma.zone.findMany({ include: { hubs: true } });
};

export const createHub = async (data: { name: string; address: string; zoneId: string }) => {
  return prisma.hub.create({ data });
};

export const listHubs = async () => {
  return prisma.hub.findMany({ include: { zone: true } });
};