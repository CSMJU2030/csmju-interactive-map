import type { Room } from '../core-hub/reference-data.types';
import { Prisma } from "@prisma/client";

export const placeInclude = {
  lecturers: { orderBy: { personCode: "asc" as const } },
  keywords: { orderBy: { keyword: "asc" as const } },
} satisfies Prisma.PlaceInclude;

export type PlaceWithRelations = Prisma.PlaceGetPayload<{
  include: typeof placeInclude;
}>;

export interface PlaceResponse {
  id: string;
  roomCode: string | null;
  nameTh: string;
  nameEn: string | null;
  description: string | null;
  category: string;
  positionX: number;
  positionY: number;
  width: number | null;
  height: number | null;
  isActive: boolean;
  lecturers: Array<{
    id: string;
    nameTh: string;
    nameEn: string | null;
    email: string | null;
    personnelType: string;
  }>;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export const mapPlace = (place: PlaceWithRelations, room: Room | null = null): PlaceResponse => ({
  id: place.id,
  roomCode: place.roomCode,
  nameTh: room?.nameTh ?? place.landmarkLabel ?? place.roomCode ?? "",
  nameEn: null,
  description: place.description,
  category: place.category,
  positionX: Number(place.positionX),
  positionY: Number(place.positionY),
  width: place.width === null ? null : Number(place.width),
  height: place.height === null ? null : Number(place.height),
  isActive: place.isActive,
  lecturers: [],
  keywords: place.keywords.map(({ keyword }) => keyword),
  createdAt: place.createdAt.toISOString(),
  updatedAt: place.updatedAt.toISOString(),
});
