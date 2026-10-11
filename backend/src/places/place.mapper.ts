import { Prisma } from "@prisma/client";

export const placeInclude = {
  lecturers: { orderBy: { personCode: "asc" as const } },
  teachingSchedule: {
    include: { lecturer: true },
    orderBy: [{ dayOfWeek: "asc" as const }, { startTime: "asc" as const }],
  },
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
  teachingSchedule: Array<{
    id: string;
    lecturerId: string;
    lecturerName: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    validFrom: string;
    validUntil: string;
    courseName: string;
  }>;
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

export const mapPlace = (place: PlaceWithRelations): PlaceResponse => ({
  id: place.id,
  roomCode: place.roomCode,
  nameTh: place.landmarkLabel ?? place.roomCode ?? "",
  nameEn: null,
  description: place.description,
  category: place.category,
  positionX: Number(place.positionX),
  positionY: Number(place.positionY),
  width: place.width === null ? null : Number(place.width),
  height: place.height === null ? null : Number(place.height),
  isActive: place.isActive,
  lecturers: place.lecturers.map((person) => ({
    id: person.id,
    personCode: person.personCode,
    nameTh: person.nameTh,
    nameEn: person.nameEn,
    email: person.email,
    personnelType: person.personnelType,
  })),
  teachingSchedule: (place.teachingSchedule ?? []).map((session) => ({
    id: session.id,
    lecturerId: session.lecturerId,
    lecturerName: session.lecturer.nameTh,
    dayOfWeek: session.dayOfWeek,
    startTime: session.startTime,
    endTime: session.endTime,
    validFrom: session.validFrom,
    validUntil: session.validUntil,
    courseName: session.courseName,
  })),
  keywords: place.keywords.map(({ keyword }) => keyword),
  createdAt: place.createdAt.toISOString(),
  updatedAt: place.updatedAt.toISOString(),
});
