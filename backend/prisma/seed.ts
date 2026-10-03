import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
async function seed() {
  // Only map geometry belongs here. Rooms and people are supplied by Core Hub.
  await prisma.mapLayout.upsert({ where: { id: 'main' }, update: {}, create: {
    id: 'main', corridorPoints: [{x:25,y:7},{x:25,y:39},{x:31,y:44},{x:84,y:44},{x:89,y:38},{x:89,y:7}], corridorWidth: 4.2,
  }});
}
void seed().finally(() => prisma.$disconnect());
