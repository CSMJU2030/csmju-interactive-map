import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { normalizeSearchQuery } from "../common/utils/search";
import { PlaceReferenceService } from './place-reference.service';
import { PrismaService } from "../prisma/prisma.service";
import type {
  CreatePlaceDto,
  PlaceListQueryDto,
  SearchPlaceQueryDto,
  UpdatePlacesLayoutDto,
  UpdatePlaceDto,
} from "./dto/place.dto";
import { mapPlace, placeInclude, type PlaceResponse } from "./place.mapper";

const DEFAULT_CORRIDOR_POINTS = [
  { x: 25, y: 7 },
  { x: 25, y: 39 },
  { x: 31, y: 44 },
  { x: 84, y: 44 },
  { x: 89, y: 38 },
  { x: 89, y: 7 },
];

export interface MapLayoutResponse {
  corridorPoints: Array<{ x: number; y: number }>;
  corridorWidth: number;
}

export interface BulkLayoutResponse {
  places: PlaceResponse[];
  mapLayout: MapLayoutResponse;
}

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService, private readonly references: PlaceReferenceService) {}

  async findAll(
    query: PlaceListQueryDto,
    token: string,
    includeInactive = false,
  ): Promise<{ data: PlaceResponse[]; total: number }> {
    const q = query.q ? normalizeSearchQuery(query.q) : '';
    const matchingCodes = q ? (await this.references.rooms(token)).filter(room => room.nameTh.toLowerCase().includes(q.toLowerCase())).map(room => room.code) : [];
    const where = this.buildWhere(query.q, query.category, includeInactive, matchingCodes);
    const [places, total] = await this.prisma.$transaction([
      this.prisma.place.findMany({
        where,
        include: placeInclude,
        orderBy: [{ category: "asc" }, { roomCode: "asc" }, { landmarkLabel: "asc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.place.count({ where }),
    ]);
    return { data: await this.mapPlaces(places, token), total };
  }

  async search(
    query: SearchPlaceQueryDto,
    token: string,
  ): Promise<{ data: PlaceResponse[]; total: number }> {
    return this.findAll({ ...query, q: query.q }, token);
  }

  async findOne(id: string, token: string): Promise<PlaceResponse> {
    const place = await this.prisma.place.findFirst({
      where: { id, isActive: true },
      include: placeInclude,
    });
    if (!place) throw new NotFoundException("ไม่พบสถานที่");
    return (await this.mapPlaces([place], token))[0];
  }

  async create(dto: CreatePlaceDto, token: string): Promise<PlaceResponse> {
    await this.references.validate(dto.roomCode, dto.nameTh, token);
    const keywords = this.normalizeKeywords(dto.keywords);
    const place = await this.prisma.place.create({
      data: {
        roomCode: dto.roomCode?.trim() || null,
        landmarkLabel: dto.roomCode ? null : dto.nameTh?.trim() || null,
        description: dto.description?.trim() || null,
        category: dto.category,
        positionX: dto.positionX,
        positionY: dto.positionY,
        width: dto.width ?? 12,
        height: dto.height ?? 8,
        isActive: dto.isActive ?? true,
        keywords: { create: keywords.map((keyword) => ({ keyword })) },
      },
      include: placeInclude,
    });
    return (await this.mapPlaces([place], token))[0];
  }

  async update(id: string, dto: UpdatePlaceDto, token: string): Promise<PlaceResponse> {
    await this.ensureExists(id);
    const current = await this.prisma.place.findUniqueOrThrow({where:{id}});
    const roomCode = dto.roomCode !== undefined ? dto.roomCode.trim() || null : current.roomCode;
    const label = dto.nameTh !== undefined ? dto.nameTh : roomCode ? null : current.landmarkLabel;
    await this.references.validate(roomCode, label, token);
    const { keywords, ...values } = dto;
    const data: Prisma.PlaceUpdateInput = {
      ...(values.roomCode !== undefined
        ? { roomCode: values.roomCode.trim() || null }
        : {}),
      landmarkLabel: roomCode ? null : label?.trim() || null,
      ...(values.description !== undefined
        ? { description: values.description.trim() || null }
        : {}),
      ...(values.category !== undefined ? { category: values.category } : {}),
      ...(values.positionX !== undefined
        ? { positionX: values.positionX }
        : {}),
      ...(values.positionY !== undefined
        ? { positionY: values.positionY }
        : {}),
      ...(values.width !== undefined ? { width: values.width } : {}),
      ...(values.height !== undefined ? { height: values.height } : {}),
      ...(values.isActive !== undefined ? { isActive: values.isActive } : {}),
      ...(keywords !== undefined
        ? {
            keywords: {
              deleteMany: {},
              create: this.normalizeKeywords(keywords).map((keyword) => ({
                keyword,
              })),
            },
          }
        : {}),
    };
    const place = await this.prisma.place.update({
      where: { id },
      data,
      include: placeInclude,
    });
    return (await this.mapPlaces([place], token))[0];
  }

  async getMapLayout(): Promise<MapLayoutResponse> {
    const layout = await this.prisma.mapLayout.findUnique({
      where: { id: "main" },
    });
    return this.mapLayout(layout);
  }

  async updateLayout(dto: UpdatePlacesLayoutDto, token: string): Promise<BulkLayoutResponse> {
    const items = dto.items ?? [];
    if (!items.length && !dto.corridor) {
      throw new BadRequestException(
        "At least one room or corridor change is required",
      );
    }
    const corridorPoints = dto.corridor?.corridorPoints.map(({ x, y }) => ({
      x,
      y,
    })) as Prisma.InputJsonValue | undefined;

    const ids = [...new Set(items.map(({ id }) => id))];
    if (ids.length !== items.length) {
      throw new BadRequestException("รหัสสถานที่ในผังต้องไม่ซ้ำกัน");
    }

    if (ids.length) {
      const existingCount = await this.prisma.place.count({
        where: { id: { in: ids } },
      });
      if (existingCount !== ids.length) {
        throw new NotFoundException("ไม่พบสถานที่อย่างน้อยหนึ่งรายการในระบบ");
      }
    }

    return this.prisma.$transaction(async (transaction) => {
      const places = await Promise.all(
        items.map((item) =>
          transaction.place.update({
            where: { id: item.id },
            data: {
              positionX: item.positionX,
              positionY: item.positionY,
              width: item.width,
              height: item.height,
            },
            include: placeInclude,
          }),
        ),
      );
      const layout = dto.corridor
        ? await transaction.mapLayout.upsert({
            where: { id: "main" },
            update: {
              corridorPoints,
              corridorWidth: dto.corridor.corridorWidth,
            },
            create: {
              id: "main",
              corridorPoints: corridorPoints!,
              corridorWidth: dto.corridor.corridorWidth,
            },
          })
        : await transaction.mapLayout.findUnique({ where: { id: "main" } });

      return {
        places: await this.mapPlaces(places, token),
        mapLayout: this.mapLayout(layout),
      };
    });
  }

  async remove(id: string): Promise<{ id: string; deleted: boolean }> {
    await this.ensureExists(id);
    await this.prisma.place.delete({ where: { id } });
    return { id, deleted: true };
  }

  async stats(): Promise<{
    totalPlaces: number;
    totalClassrooms: number;
    totalLabs: number;
    totalLecturerOffices: number;
    totalActive: number;
  }> {
    const [total, classrooms, labs, offices, active] =
      await this.prisma.$transaction([
        this.prisma.place.count(),
        this.prisma.place.count({ where: { category: "CLASSROOM" } }),
        this.prisma.place.count({ where: { category: "COMPUTER_LAB" } }),
        this.prisma.place.count({ where: { category: "LECTURER_OFFICE" } }),
        this.prisma.place.count({ where: { isActive: true } }),
      ]);
    return {
      totalPlaces: total,
      totalClassrooms: classrooms,
      totalLabs: labs,
      totalLecturerOffices: offices,
      totalActive: active,
    };
  }

  private buildWhere(
    rawQuery?: string,
    category?: Prisma.EnumPlaceCategoryFilter["equals"],
    includeInactive = false,
    matchingCodes: string[] = [],
  ): Prisma.PlaceWhereInput {
    const q = rawQuery ? normalizeSearchQuery(rawQuery) : "";
    return {
      ...(includeInactive ? {} : { isActive: true }),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { landmarkLabel: { contains: q, mode: "insensitive" } },
              { roomCode: { in: matchingCodes } },
              { roomCode: { contains: q, mode: "insensitive" } },
              {
                keywords: {
                  some: { keyword: { contains: q, mode: "insensitive" } },
                },
              },
            ],
          }
        : {}),
    };
  }

  private async mapPlaces(places: Parameters<typeof mapPlace>[0][], token: string): Promise<PlaceResponse[]> {
    return Promise.all(places.map(async place => mapPlace(place, place.roomCode ? await this.references.room(place.roomCode, token) : null)));
  }

  async availableRooms(token: string) { return this.references.rooms(token); }

  private normalizeKeywords(keywords: string[] | undefined): string[] {
    return [
      ...new Set((keywords ?? []).map(normalizeSearchQuery).filter(Boolean)),
    ];
  }

  private mapLayout(
    layout: {
      corridorPoints: Prisma.JsonValue;
      corridorWidth: Prisma.Decimal;
    } | null,
  ): MapLayoutResponse {
    const points = Array.isArray(layout?.corridorPoints)
      ? layout.corridorPoints.filter(
          (point): point is { x: number; y: number } =>
            typeof point === "object" &&
            point !== null &&
            !Array.isArray(point) &&
            typeof point.x === "number" &&
            typeof point.y === "number",
        )
      : [];
    return {
      corridorPoints: points.length >= 2 ? points : DEFAULT_CORRIDOR_POINTS,
      corridorWidth: layout ? Number(layout.corridorWidth) : 4.2,
    };
  }

  private async ensureExists(id: string): Promise<void> {
    const count = await this.prisma.place.count({ where: { id } });
    if (!count) throw new NotFoundException("ไม่พบสถานที่");
  }
}
