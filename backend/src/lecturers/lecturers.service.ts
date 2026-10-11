import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AppException } from "../common/errors";
import { PrismaService } from "../prisma/prisma.service";
import {
  normalizedPersonnelName,
  parseCsmjuPersonnels,
  personnelSourceUrl,
  safePersonnelImage,
} from "./csmju-personnels";
import {
  CreateLecturerDto,
  LecturerListQueryDto,
  UpdateLecturerDto,
} from "./dto/lecturer.dto";
type Assignment = Prisma.LecturerGetPayload<{
  include: { place: true; teachingSchedule: { include: { place: true } } };
}>;
@Injectable()
export class LecturersService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(query: LecturerListQueryDto, _token?: string) {
    void _token;
    const q = query.q?.trim();
    const where: Prisma.LecturerWhereInput = {
      ...(query.personnelType ? { personnelType: query.personnelType } : {}),
      ...(q
        ? {
            OR: ["nameTh", "nameEn", "personCode", "email"].map((field) => ({
              [field]: { contains: q, mode: "insensitive" },
            })),
          }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.lecturer.findMany({
        where,
        include: {
          place: true,
          teachingSchedule: { include: { place: true } },
        },
        orderBy: { nameTh: "asc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.lecturer.count({ where }),
    ]);
    return { data: rows.map((row) => this.present(row)), total };
  }
  async directory(query: LecturerListQueryDto, token?: string) {
    return this.findAll(query, token);
  }
  async importCsmju() {
    let people;
    try {
      const response = await fetch(personnelSourceUrl, {
        signal: AbortSignal.timeout(20000),
        redirect: "error",
      });
      if (!response.ok) throw new Error("Source unavailable");
      const html = await response.text();
      if (html.length > 5_000_000) throw new Error("Source too large");
      people = parseCsmjuPersonnels(html);
    } catch {
      throw AppException.serviceUnavailable(
        "ดึงข้อมูลบุคลากรจากเว็บสาขาไม่สำเร็จ กรุณาลองใหม่ภายหลัง",
        30,
      );
    }
    return this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.lecturer.findMany({
          include: { _count: { select: { teachingSchedule: true } } },
        });
        let created = 0;
        let updated = 0;
        const skipped: string[] = [];
        const claimed = new Set<string>();
        for (const person of people) {
          const linked = existing.filter(
            (row) => row.sourcePersonnelId === person.id,
          );
          const matches = linked.length
            ? linked
            : existing.filter(
                (row) =>
                  !row.sourcePersonnelId &&
                  (normalizedPersonnelName(row.nameTh) ===
                    normalizedPersonnelName(person.fullnameTh) ||
                    Boolean(
                      person.email &&
                      row.email?.toLowerCase() === person.email.toLowerCase(),
                    )),
              );
          const match = matches[0];
          if (
            matches.length > 1 ||
            (match && claimed.has(match.id)) ||
            (match &&
              person.personnelType === "เจ้าหน้าที่" &&
              match._count.teachingSchedule > 0)
          ) {
            skipped.push(person.fullnameTh);
            continue;
          }
          const data = {
            sourcePersonnelId: person.id,
            nameTh: (
              (person.prefix?.trim() ?? "") +
              " " +
              person.fullnameTh
            ).trim(),
            nameEn: person.fullnameEn || null,
            personnelType:
              person.personnelType === "อาจารย์"
                ? ("TEACHER" as const)
                : ("STAFF" as const),
            email: person.email || null,
            positionAcademic: person.academicPosition || null,
            positionManager: person.administrativePosition || null,
            imageProfile: safePersonnelImage(person.profileImage?.url),
            phone: person.phoneNumber || null,
            education: person.education || null,
          };
          if (match) {
            await tx.lecturer.update({ where: { id: match.id }, data });
            claimed.add(match.id);
            updated++;
          } else {
            await tx.lecturer.create({
              data: { ...data, personCode: "CSMJU-" + person.id },
            });
            created++;
          }
        }
        return { created, updated, skipped, sourceUrl: personnelSourceUrl };
      },
      { timeout: 20000 },
    );
  }
  async create(dto: CreateLecturerDto, _token?: string) {
    void _token;
    this.validate(dto);
    if (dto.placeId) await this.ensurePlace(dto.placeId);
    const row = await this.prisma.lecturer.create({
      data: {
        ...dto,
        personCode: dto.personCode.trim(),
        nameTh: dto.nameTh.trim(),
        placeId: dto.placeId || null,
      },
      include: { place: true, teachingSchedule: { include: { place: true } } },
    });
    return this.present(row);
  }
  async update(id: string, dto: UpdateLecturerDto, _token?: string) {
    void _token;
    await this.ensureAssignment(id);
    this.validate(dto);
    if (
      dto.personnelType === "STAFF" &&
      (await this.prisma.teachingSession.count({ where: { lecturerId: id } }))
    )
      throw AppException.badRequest(
        "กรุณาลบตารางสอนของบุคลากรก่อนเปลี่ยนเป็นเจ้าหน้าที่",
      );
    if (dto.placeId) await this.ensurePlace(dto.placeId);
    const row = await this.prisma.lecturer.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.personCode !== undefined
          ? { personCode: dto.personCode.trim() }
          : {}),
        ...(dto.nameTh !== undefined ? { nameTh: dto.nameTh.trim() } : {}),
        ...(dto.placeId !== undefined ? { placeId: dto.placeId || null } : {}),
      },
      include: { place: true, teachingSchedule: { include: { place: true } } },
    });
    return this.present(row);
  }
  async remove(id: string) {
    await this.ensureAssignment(id);
    await this.prisma.lecturer.delete({ where: { id } });
    return { id, deleted: true };
  }
  private validate(dto: UpdateLecturerDto) {
    if (dto.nameTh !== undefined && !dto.nameTh?.trim())
      throw AppException.badRequest("กรุณากรอกชื่อบุคลากร");
    if (dto.personCode !== undefined && !dto.personCode?.trim())
      throw AppException.badRequest("กรุณากรอกรหัสบุคลากร");
  }
  private async ensurePlace(id: string) {
    const place = await this.prisma.place.findUnique({ where: { id } });
    if (!place || !place.isActive)
      throw AppException.badRequest("กรุณาเลือกสถานที่ที่เปิดใช้งานบนแผนที่");
  }
  private async ensureAssignment(id: string) {
    if (!(await this.prisma.lecturer.count({ where: { id } })))
      throw AppException.notFound("ไม่พบบุคลากร");
  }
  private present(row: Assignment) {
    return {
      id: row.id,
      personCode: row.personCode,
      nameTh: row.nameTh,
      nameEn: row.nameEn,
      email: row.email,
      personnelType: row.personnelType,
      positionAcademic: row.positionAcademic,
      positionManager: row.positionManager,
      placeId: row.placeId,
      teachingSchedule: (row.teachingSchedule ?? [])
        .filter((session) => session.place.isActive)
        .map((session) => ({
          ...session,
          lecturerName: row.nameTh,
          place: {
            id: session.place.id,
            roomCode: session.place.roomCode,
            nameTh: session.place.landmarkLabel ?? session.place.roomCode ?? "",
            nameEn: null,
            category: session.place.category,
            positionX: Number(session.place.positionX),
            positionY: Number(session.place.positionY),
            isActive: session.place.isActive,
          },
        })),
      sourceId: null,
      title: null,
      imageProfile: row.imageProfile,
      sourceUrl: row.sourcePersonnelId
        ? personnelSourceUrl + "/" + row.sourcePersonnelId
        : null,
      phone: row.phone,
      education: row.education,
      academicType: null,
      place: row.place
        ? {
            id: row.place.id,
            roomCode: row.place.roomCode,
            nameTh: row.place.landmarkLabel ?? row.place.roomCode ?? "",
            nameEn: null,
            category: row.place.category,
            positionX: Number(row.place.positionX),
            positionY: Number(row.place.positionY),
            isActive: row.place.isActive,
          }
        : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
