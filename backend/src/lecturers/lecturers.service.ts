import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { AppException, ErrorCode } from '../common/errors';
import { coreHubFailure, getFromCoreHub } from '../core-hub/core-hub-http';
import { PrismaService } from '../prisma/prisma.service';
import { PlaceReferenceService } from '../places/place-reference.service';
import { CreateLecturerDto, LecturerListQueryDto, UpdateLecturerDto } from './dto/lecturer.dto';

interface CorePerson {
  personCode: string; personType: string; staffType: string | null;
  coreUserId: string | null; fullNameTh: string; fullNameEn: string | null;
  academicTitle: string | null; jobTitle: string | null; universityEmail?: string;
}
type Assignment = Prisma.LecturerGetPayload<{ include: {place: true} }>;

@Injectable()
export class LecturersService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService, private readonly rooms: PlaceReferenceService) {}

  private async coreData(path: string, token: string): Promise<{data: unknown; meta?: Record<string, number>}> {
    try {
      const url = this.config.get<string>('coreHub.url') as string;
      const body = await getFromCoreHub(url + '/api/v1' + path, token, 5000) as {success?:boolean; data?:unknown; meta?:Record<string,number>};
      if (body.success !== true) throw new Error('Invalid Core Hub response');
      return {data:body.data, meta:body.meta};
    } catch(error) { throw coreHubFailure(error); }
  }

  private async person(code: string, token: string): Promise<CorePerson> {
    const body = await this.coreData('/people/' + encodeURIComponent(code), token);
    const person = body.data as CorePerson;
    if (!person || person.personCode !== code || typeof person.fullNameTh !== 'string') throw coreHubFailure(new Error('Invalid person response'));
    if(person.personType !== 'STAFF') throw new AppException(ErrorCode.VALIDATION_ERROR, 'เลือกบุคลากรจาก Core Hub เท่านั้น', HttpStatus.BAD_REQUEST);
    return person;
  }

  // Personal information is requested afresh on every call, never cached or persisted.
  async availablePeople(query: LecturerListQueryDto, token: string) {
    const params = new URLSearchParams({personType:'STAFF', page:String(query.page), limit:String(query.limit)});
    if(query.q) params.set('q',query.q);
    const body = await this.coreData('/people?' + params.toString(), token);
    return {data:(body.data as CorePerson[]).map(person => ({personCode:person.personCode, nameTh:person.fullNameTh, personnelType:person.staffType === 'LECTURER' ? 'TEACHER' : 'STAFF'})), total:body.meta?.total ?? 0};
  }

  async findAll(query: LecturerListQueryDto, token: string) {
    const assignments = await this.prisma.lecturer.findMany({include:{place:true},orderBy:{personCode:'asc'}});
    const data = [];
    for(const assignment of assignments) data.push(await this.present(assignment, token));
    const q = (query.q ?? '').trim().toLowerCase();
    const filtered = data.filter(row => (!query.personnelType || row.personnelType === query.personnelType) && (!q || [row.nameTh,row.nameEn,row.personCode].some(value=>value?.toLowerCase().includes(q))));
    return {data:filtered.slice((query.page-1)*query.limit,query.page*query.limit),total:filtered.length};
  }

  async create(dto: CreateLecturerDto, token: string) {
    const person = await this.person(dto.personCode, token);
    if(dto.placeId) await this.ensurePlace(dto.placeId, token);
    const row = await this.prisma.lecturer.create({data:{personCode:person.personCode,coreUserId:person.coreUserId,placeId:dto.placeId ?? null},include:{place:true}});
    return this.present(row,token,person);
  }

  async update(id: string, dto: UpdateLecturerDto, token: string) {
    await this.ensureAssignment(id);
    const person = dto.personCode ? await this.person(dto.personCode,token) : undefined;
    if(dto.placeId) await this.ensurePlace(dto.placeId, token);
    const row = await this.prisma.lecturer.update({where:{id},data:{
      ...(person ? {personCode:person.personCode,coreUserId:person.coreUserId}:{}),
      ...(dto.placeId !== undefined ? {placeId:dto.placeId || null}:{}),
    },include:{place:true}});
    return this.present(row,token,person);
  }

  async remove(id:string) { await this.ensureAssignment(id); await this.prisma.lecturer.delete({where:{id}}); return {id,deleted:true}; }
  private async ensurePlace(id:string, token:string) {
    const place = await this.prisma.place.findUnique({where:{id}});
    if(!place) throw AppException.notFound('ไม่พบจุดบนแผนที่');
    if(!place.roomCode || !place.isActive) throw new AppException(ErrorCode.VALIDATION_ERROR, 'เลือกห้องที่เปิดใช้งานจาก Core Hub เท่านั้น', HttpStatus.BAD_REQUEST);
    await this.rooms.validate(place.roomCode, null, token);
  }
  private async ensureAssignment(id:string) { if(!await this.prisma.lecturer.count({where:{id}})) throw AppException.notFound('ไม่พบการกำหนดห้องบุคลากร'); }

  private async present(row:Assignment, token:string, person?:CorePerson) {
    const details = person ?? await this.person(row.personCode,token);
    const room = row.place?.roomCode ? await this.rooms.room(row.place.roomCode,token) : null;
    return {id:row.id,personCode:row.personCode,sourceId:null,title:null,nameTh:details.fullNameTh,nameEn:details.fullNameEn,
      personnelType:details.staffType === 'LECTURER' ? 'TEACHER' : 'STAFF',positionAcademic:details.academicTitle,positionManager:details.jobTitle,
      imageProfile:null,email:details.universityEmail ?? null,phone:null,education:null,academicType:null,
      placeId:row.placeId,place:row.place ? {id:row.place.id,roomCode:row.place.roomCode,nameTh:room?.nameTh ?? row.place.landmarkLabel ?? row.place.roomCode ?? '',nameEn:null,category:row.place.category,positionX:Number(row.place.positionX),positionY:Number(row.place.positionY),isActive:row.place.isActive}:null,
      createdAt:row.createdAt.toISOString(),updatedAt:row.updatedAt.toISOString()};
  }
}
