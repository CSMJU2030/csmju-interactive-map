import { ConfigService } from '@nestjs/config';
import { LecturersService } from './lecturers.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlaceReferenceService } from '../places/place-reference.service';
import { getFromCoreHub } from '../core-hub/core-hub-http';

jest.mock('../core-hub/core-hub-http', () => ({
  ...jest.requireActual('../core-hub/core-hub-http'),
  getFromCoreHub: jest.fn(),
}));

describe('Personnel assignments', () => {
  const request = jest.mocked(getFromCoreHub);
  const create = jest.fn();
  const findUnique = jest.fn();
  const validate = jest.fn();
  const prisma = {lecturer:{create},place:{findUnique}} as unknown as PrismaService;
  const service = new LecturersService(prisma, new ConfigService({coreHub:{url:'https://core.example'}}), {validate} as unknown as PlaceReferenceService);
  const person = {personCode:'P-101',personType:'STAFF',staffType:'LECTURER',coreUserId:'core-id',fullNameTh:'ชื่อจาก Core',fullNameEn:null,academicTitle:null,jobTitle:null,universityEmail:'person@example.test'};
  beforeEach(() => {
    jest.resetAllMocks();
    request.mockResolvedValue({success:true,data:person});
    create.mockResolvedValue({id:'assignment',personCode:'P-101',coreUserId:'core-id',placeId:null,place:null,createdAt:new Date(),updatedAt:new Date()});
  });
  it('persists only identifiers and reads personal data afresh for every operation', async () => {
    await service.create({personCode:'P-101'}, 'caller-token');
    await service.create({personCode:'P-101'}, 'caller-token');
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenCalledWith('https://core.example/api/v1/people/P-101', 'caller-token', 5000);
    expect(create.mock.calls[0][0].data).toEqual({personCode:'P-101',coreUserId:'core-id',placeId:null});
  });
  it('rejects a student before writing an assignment', async () => {
    request.mockResolvedValue({success:true,data:{...person,personType:'STUDENT'}});
    await expect(service.create({personCode:'P-101'}, 'token')).rejects.toMatchObject({status:400});
    expect(create).not.toHaveBeenCalled();
  });
  it('rejects a locally owned landmark as a personnel room', async () => {
    findUnique.mockResolvedValue({id:'point',roomCode:null,isActive:true});
    await expect(service.create({personCode:'P-101',placeId:'point'}, 'token')).rejects.toMatchObject({status:400});
    expect(create).not.toHaveBeenCalled();
  });
  it('does not write when Core room validation fails', async () => {
    findUnique.mockResolvedValue({id:'room',roomCode:'CS-101',isActive:true});
    const failure = new Error('Core room is inactive');
    validate.mockRejectedValue(failure);
    await expect(service.create({personCode:'P-101',placeId:'room'}, 'token')).rejects.toBe(failure);
    expect(validate).toHaveBeenCalledWith('CS-101', null, 'token');
    expect(create).not.toHaveBeenCalled();
  });
});
