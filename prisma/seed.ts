import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@courier.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log('Admin user ready:', admin.email);

  const zone = await prisma.zone.upsert({
    where: { name: 'Dhaka Metro' },
    update: {},
    create: { name: 'Dhaka Metro', region: 'Dhaka' },
  });

  const hub1 = await prisma.hub.create({
    data: { name: 'Dhaka Central Hub', address: 'Motijheel, Dhaka', zoneId: zone.id },
  });
  const hub2 = await prisma.hub.create({
    data: { name: 'Gulshan Hub', address: 'Gulshan, Dhaka', zoneId: zone.id },
  });

  console.log('Seeded zone and hubs:', zone.name, hub1.name, hub2.name);

  const courierPassword = await bcrypt.hash('Courier@12345', 10);
  const courier = await prisma.user.upsert({
    where: { email: 'courier@courier.com' },
    update: {},
    create: {
      name: 'Demo Courier',
      email: 'courier@courier.com',
      password: courierPassword,
      role: Role.COURIER,
      courierProfile: {
        create: {
          vehicleType: 'MOTORBIKE',
          zoneId: zone.id,
          isAvailable: true,
        },
      },
    },
  });
  console.log('Demo courier ready:', courier.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });