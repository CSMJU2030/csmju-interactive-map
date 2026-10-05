import 'dotenv/config';
import { PrismaClient, PlaceCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Geometry transcribed from Screenshot 2026-10-01 154145.png.
// Room identifiers are the existing Core Hub codes, not invented legacy codes.
const rooms = [
  { roomCode: 'LAB-1', category: PlaceCategory.COMPUTER_LAB, positionX: 27, positionY: 6, width: 16, height: 15 },
  { roomCode: 'LAB-4', category: PlaceCategory.COMPUTER_LAB, positionX: 45, positionY: 6, width: 16, height: 15 },
  { roomCode: 'LAB-2', category: PlaceCategory.COMPUTER_LAB, positionX: 27, positionY: 23, width: 16, height: 15 },
  { roomCode: 'LAB-3', category: PlaceCategory.COMPUTER_LAB, positionX: 45, positionY: 23, width: 16, height: 15 },
  { roomCode: 'LECT-8', category: PlaceCategory.CLASSROOM, positionX: 87, positionY: 6, width: 9.5, height: 10 },
  { roomCode: 'LECT-6', category: PlaceCategory.CLASSROOM, positionX: 87, positionY: 28, width: 9.5, height: 13 },
  { roomCode: 'LABCOM-5', category: PlaceCategory.COMPUTER_LAB, positionX: 63, positionY: 6, width: 15, height: 10 },
  { roomCode: 'LAB-NETWORK', category: PlaceCategory.COMPUTER_LAB, positionX: 63, positionY: 28, width: 15, height: 10 },
];

const landmarks = [
  { landmarkLabel: 'LECT-OFFICE', description: 'ห้องพักอาจารย์', category: PlaceCategory.LECTURER_OFFICE, positionX: 3.5, positionY: 6, width: 15, height: 35 },
  { landmarkLabel: 'Storage Room', description: 'ห้องเก็บของ', category: PlaceCategory.STORAGE, positionX: 63, positionY: 18, width: 15, height: 8 },
  { landmarkLabel: 'CLUB-01', description: 'ห้องชมรม', category: PlaceCategory.STUDENT_CLUB, positionX: 87, positionY: 18, width: 9.5, height: 8 },
  { landmarkLabel: 'LIFT-01', description: 'ลิฟต์', category: PlaceCategory.FACILITY, positionX: 32, positionY: 49, width: 10, height: 8 },
  { landmarkLabel: 'REST-M', description: 'ห้องน้ำชาย', category: PlaceCategory.RESTROOM, positionX: 43.5, positionY: 49, width: 14, height: 8 },
  { landmarkLabel: 'REST-F', description: 'ห้องน้ำหญิง', category: PlaceCategory.RESTROOM, positionX: 67, positionY: 49, width: 14, height: 8 },
];

async function restore() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');
  const url = new URL(connectionString);
  if (process.env.NODE_ENV === 'production' || !['127.0.0.1', 'localhost'].includes(url.hostname) || url.pathname !== '/csmju_map_preview_20261004') {
    throw new Error('This restore is restricted to the existing local preview database.');
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const snapshot = {
      places: await prisma.place.findMany({ include: { keywords: true, lecturers: true } }),
      layouts: await prisma.mapLayout.findMany(),
    };
    const backupDir = join(process.env.LOCALAPPDATA ?? process.cwd(), 'csmju-map', 'backups');
    await mkdir(backupDir, { recursive: true });
    const backupPath = join(backupDir, `before-reference-layout-${Date.now()}.json`);
    await writeFile(backupPath, JSON.stringify(snapshot, null, 2), 'utf8');
    await prisma.$transaction(async (tx) => {
      for (const room of rooms) {
        await tx.place.upsert({ where: { roomCode: room.roomCode }, update: { ...room, isActive: true }, create: room });
      }
      for (const landmark of landmarks) {
        const existing = await tx.place.findFirst({ where: { roomCode: null, landmarkLabel: landmark.landmarkLabel } });
        if (existing) await tx.place.update({ where: { id: existing.id }, data: { ...landmark, isActive: true } });
        else await tx.place.create({ data: landmark });
      }
      const layout = {
        corridorPoints: [{ x: 23, y: 3 }, { x: 23, y: 41 }, { x: 28, y: 44.5 }, { x: 78, y: 44.5 }, { x: 83, y: 41 }, { x: 83, y: 3 }],
        corridorWidth: 4.5,
      };
      await tx.mapLayout.upsert({ where: { id: 'main' }, create: { id: 'main', ...layout }, update: layout });
    });
    console.log(`Restored ${rooms.length} Core Hub room positions and ${landmarks.length} map landmarks. Backup: ${backupPath}`);
    console.log('The former LECT-07 and LECT-05 slots use LABCOM-5 and LAB-NETWORK respectively, as requested.');
  } finally {
    await prisma.$disconnect();
  }
}

void restore().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
