import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { normalizeSearchQuery } from "../common/utils/search";
import { PlaceReferenceService } from "./place-reference.service";
import { PrismaService } from "../prisma/prisma.service";
import type {
  CreatePlaceDto,
  PlaceListQueryDto,
  SearchPlaceQueryDto,
  UpdatePlacesLayoutDto,
  UpdatePlaceDto,
  TeachingSessionInputDto,
} from "./dto/place.dto";
import { mapPlace, placeInclude, type PlaceResponse } from "./place.mapper";
import { AppException } from "../common/errors";
import {
  parseRegistrarTimetable,
  RegistrarQueryDto,
} from "./registrar-timetable";

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly references: PlaceReferenceService,
  ) {}

  async registrarTimetable(query: RegistrarQueryDto) {
    const url = new URL("https://reg.mju.ac.th/registrar/class_info_1.asp");
    url.search = new URLSearchParams({
      cmd: "2",
      coursestatus: "O00",
      facultyid: "all",
      maxrow: "250",
      acadyear: String(query.academicYear),
      semester: String(query.semester),
      CAMPUSID: "50",
      LEVELID: "",
      coursecode: "10301*",
      coursename: "",
    }).toString();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error("Registrar response failed");
      const html = new TextDecoder("windows-874").decode(
        await response.arrayBuffer(),
      );
      if (!html.includes("class_info") || !html.includes("รหัสวิชา"))
        throw new Error("Unexpected registrar page");
      return parseRegistrarTimetable(html);
    } catch {
      throw AppException.serviceUnavailable(
        "ดึงตารางจากทะเบียนไม่สำเร็จ กรุณาลองใหม่หรือกรอกตารางสอนเอง",
        30,
      );
    }
  }

  async findAll(
    query: PlaceListQueryDto,
    token = "",
    includeInactive = false,
  ): Promise<{ data: PlaceResponse[]; total: number }> {
    const where = this.buildWhere(query.q, query.category, includeInactive);
    const [places, total] = await this.prisma.$transaction([
      this.prisma.place.findMany({
        where,
        include: placeInclude,
        orderBy: [
          { category: "asc" },
          { roomCode: "asc" },
          { landmarkLabel: "asc" },
        ],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.place.count({ where }),
    ]);
    return { data: this.mapPlaces(places, token), total };
  }

  async search(
    query: SearchPlaceQueryDto,
    token = "",
  ): Promise<{ data: PlaceResponse[]; total: number }> {
    return this.findAll({ ...query, q: query.q }, token);
  }

  async findOne(id: string, token = ""): Promise<PlaceResponse> {
    const place = await this.prisma.place.findFirst({
      where: { id, isActive: true },
      include: placeInclude,
    });
    if (!place) throw new NotFoundException("ไม่พบสถานที่");
    return this.mapPlaces([place], token)[0];
  }

  async create(dto: CreatePlaceDto, token: string): Promise<PlaceResponse> {
    this.references.validate(dto.roomCode, dto.nameTh, token);
    await this.validateSchedule(dto.teachingSchedule ?? []);
    const keywords = this.normalizeKeywords(dto.keywords);
    const place = await this.prisma.place.create({
      data: {
        roomCode: dto.roomCode?.trim() || null,
        landmarkLabel: dto.nameTh?.trim() || null,
        description: dto.description?.trim() || null,
        category: dto.category,
        positionX: dto.positionX,
        positionY: dto.positionY,
        width: dto.width ?? 12,
        height: dto.height ?? 8,
        isActive: dto.isActive ?? true,
        teachingSchedule: { create: dto.teachingSchedule ?? [] },
        keywords: { create: keywords.map((keyword) => ({ keyword })) },
      },
      include: placeInclude,
    });
    return this.mapPlaces([place], token)[0];
  }

  async update(
    id: string,
    dto: UpdatePlaceDto,
    token: string,
  ): Promise<PlaceResponse> {
    await this.ensureExists(id);
    const current = await this.prisma.place.findUniqueOrThrow({
      where: { id },
    });
    const roomCode =
      dto.roomCode !== undefined
        ? dto.roomCode?.trim() || null
        : current.roomCode;
    const label = dto.nameTh !== undefined ? dto.nameTh : current.landmarkLabel;
    this.references.validate(roomCode, label, token);
    if (dto.teachingSchedule !== undefined)
      await this.validateSchedule(dto.teachingSchedule, id);
    const { keywords, ...values } = dto;
    const data: Prisma.PlaceUpdateInput = {
      ...(dto.teachingSchedule !== undefined
        ? { teachingSchedule: { deleteMany: {}, create: dto.teachingSchedule } }
        : {}),
      ...(values.roomCode !== undefined
        ? { roomCode: values.roomCode?.trim() || null }
        : {}),
      landmarkLabel: label?.trim() || null,
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
    return this.mapPlaces([place], token)[0];
  }

  async getMapLayout(): Promise<MapLayoutResponse> {
    const layout = await this.prisma.mapLayout.findUnique({
      where: { id: "main" },
    });
    return this.mapLayout(layout);
  }

  async updateLayout(
    dto: UpdatePlacesLayoutDto,
    token: string,
  ): Promise<BulkLayoutResponse> {
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
        places: this.mapPlaces(places, token),
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
  ): Prisma.PlaceWhereInput {
    const q = rawQuery ? normalizeSearchQuery(rawQuery) : "";
    return {
      ...(includeInactive ? {} : { isActive: true }),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { landmarkLabel: { contains: q, mode: "insensitive" } },
              {
                lecturers: {
                  some: { nameTh: { contains: q, mode: "insensitive" } },
                },
              },
              {
                teachingSchedule: {
                  some: {
                    lecturer: { nameTh: { contains: q, mode: "insensitive" } },
                  },
                },
              },
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

  private mapPlaces(
    places: Parameters<typeof mapPlace>[0][],
    _token: string,
  ): PlaceResponse[] {
    void _token;
    return places.map((place) => mapPlace(place));
  }

  private async validateSchedule(
    sessions: TeachingSessionInputDto[],
    placeId?: string,
  ): Promise<void> {
    if (!Array.isArray(sessions))
      throw new BadRequestException("รูปแบบตารางสอนไม่ถูกต้อง");
    const validDate = (value: string) => {
      const date = new Date(value + "T00:00:00Z");
      return (
        Number.isFinite(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };
    const overlaps = (
      a: TeachingSessionInputDto,
      b: TeachingSessionInputDto,
    ) => {
      if (
        a.dayOfWeek !== b.dayOfWeek ||
        a.startTime >= b.endTime ||
        b.startTime >= a.endTime
      )
        return false;
      const from = a.validFrom > b.validFrom ? a.validFrom : b.validFrom;
      const until = a.validUntil < b.validUntil ? a.validUntil : b.validUntil;
      if (from > until) return false;
      const first = new Date(from + "T00:00:00Z");
      first.setUTCDate(
        first.getUTCDate() + ((a.dayOfWeek - first.getUTCDay() + 7) % 7),
      );
      return first.toISOString().slice(0, 10) <= until;
    };
    for (const [index, session] of sessions.entries()) {
      if (
        !session.courseName.trim() ||
        session.startTime >= session.endTime ||
        !validDate(session.validFrom) ||
        !validDate(session.validUntil) ||
        session.validFrom > session.validUntil
      ) {
        throw new BadRequestException(
          "กรุณาตรวจชื่อวิชา เวลาเริ่ม–สิ้นสุด และช่วงวันที่ของตารางสอน",
        );
      }
      if (
        sessions
          .slice(0, index)
          .some(
            (other) =>
              overlaps(session, other) &&
              !(
                session.lecturerId !== other.lecturerId &&
                session.courseName === other.courseName &&
                session.startTime === other.startTime &&
                session.endTime === other.endTime &&
                session.validFrom === other.validFrom &&
                session.validUntil === other.validUntil
              ),
          )
      )
        throw new BadRequestException("ช่วงเวลาสอนในห้องเดียวกันซ้อนกัน");
    }
    if (!sessions.length) return;
    const ids = [...new Set(sessions.map((session) => session.lecturerId))];
    if (
      (await this.prisma.lecturer.count({
        where: { id: { in: ids }, personnelType: "TEACHER" },
      })) !== ids.length
    )
      throw new BadRequestException("กรุณาเลือกอาจารย์ที่มีข้อมูลในระบบ");
    const others = await this.prisma.teachingSession.findMany({
      where: {
        lecturerId: { in: ids },
        ...(placeId ? { placeId: { not: placeId } } : {}),
      },
    });
    if (
      sessions.some((session) =>
        others.some(
          (other) =>
            session.lecturerId === other.lecturerId && overlaps(session, other),
        ),
      )
    )
      throw new BadRequestException("อาจารย์มีตารางสอนซ้อนกับห้องอื่น");
  }

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
