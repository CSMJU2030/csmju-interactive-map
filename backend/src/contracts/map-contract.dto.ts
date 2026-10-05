import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiProperty, ApiPropertyOptional, ApiResponse, PickType, getSchemaPath } from '@nestjs/swagger';
import { PlaceCategory } from '@prisma/client';

export class MapPointDto {
  @ApiProperty() x!: number;
  @ApiProperty() y!: number;
}
export class MapLayoutDto {
  @ApiProperty({type:[MapPointDto]}) corridorPoints!: MapPointDto[];
  @ApiProperty() corridorWidth!: number;
}
export class LecturerSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() personCode!: string;
  @ApiProperty() nameTh!: string;
  @ApiProperty({type:String,nullable:true}) nameEn!: string | null;
  @ApiProperty({type:String,nullable:true}) email!: string | null;
  @ApiProperty({enum:['TEACHER','STAFF']}) personnelType!: 'TEACHER' | 'STAFF';
}
export class PlaceResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({type:String,nullable:true}) roomCode!: string | null;
  @ApiProperty() nameTh!: string;
  @ApiProperty({type:String,nullable:true}) nameEn!: string | null;
  @ApiProperty({type:String,nullable:true}) description!: string | null;
  @ApiProperty({enum:PlaceCategory}) category!: PlaceCategory;
  @ApiProperty() positionX!: number;
  @ApiProperty() positionY!: number;
  @ApiProperty({type:Number,nullable:true}) width!: number | null;
  @ApiProperty({type:Number,nullable:true}) height!: number | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({type:[LecturerSummaryDto]}) lecturers!: LecturerSummaryDto[];
  @ApiProperty({type:[String]}) keywords!: string[];
  @ApiProperty({format:'date-time'}) createdAt!: string;
  @ApiProperty({format:'date-time'}) updatedAt!: string;
}
export class AssignmentPlaceDto extends PickType(PlaceResponseDto, ['id', 'roomCode', 'nameTh', 'nameEn', 'category', 'positionX', 'positionY', 'isActive'] as const) {}
export class LecturerResponseDto extends LecturerSummaryDto {
  @ApiProperty({type:Number,nullable:true}) sourceId!: number | null;
  @ApiProperty({type:String,nullable:true}) title!: string | null;
  @ApiProperty({type:String,nullable:true}) positionAcademic!: string | null;
  @ApiProperty({type:String,nullable:true}) positionManager!: string | null;
  @ApiProperty({type:String,nullable:true}) imageProfile!: string | null;
  @ApiProperty({type:String,nullable:true}) phone!: string | null;
  @ApiProperty({type:String,nullable:true}) education!: string | null;
  @ApiProperty({type:String,nullable:true}) academicType!: string | null;
  @ApiProperty({type:String,nullable:true}) placeId!: string | null;
  @ApiProperty({type:AssignmentPlaceDto,nullable:true}) place!: AssignmentPlaceDto | null;
  @ApiProperty({format:'date-time'}) createdAt!: string;
  @ApiProperty({format:'date-time'}) updatedAt!: string;
}
export class PersonnelDirectoryDto extends PickType(LecturerResponseDto, [
  'personCode', 'nameTh', 'nameEn', 'personnelType',
  'positionAcademic', 'positionManager', 'email',
] as const) {}

export class SessionDto {
  @ApiProperty({type:String,nullable:true,format:'date-time'}) expiresAt!: string | null;
}
export class CurrentUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty({enum:['student','alumni','staff','lecturer','guest','admin']}) coreRole!: string;
  @ApiProperty({enum:['STUDENT','ALUMNI','STAFF','ADMIN']}) subsystemRole!: string;
  @ApiProperty({type:SessionDto}) session!: SessionDto;
}
export class DashboardStatsDto {
  @ApiProperty() totalPlaces!: number;
  @ApiProperty() totalClassrooms!: number;
  @ApiProperty() totalLabs!: number;
  @ApiProperty() totalLecturerOffices!: number;
  @ApiProperty() totalActive!: number;
}
export class PaginationMetaDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() totalPages!: number;
}
export class ApiEnvelopeDto {
  @ApiProperty({enum:[true],type:Boolean}) success!: true;
  @ApiProperty({type:Object}) data!: object;
  @ApiPropertyOptional({type:PaginationMetaDto}) meta?: PaginationMetaDto;
}
export class ApiErrorDto {
  @ApiProperty() code!: string;
  @ApiProperty() message!: string;
  @ApiPropertyOptional({type:Object}) details?: object;
}
export class ApiErrorEnvelopeDto {
  @ApiProperty({enum:[false],type:Boolean}) success!: false;
  @ApiProperty({type:ApiErrorDto}) error!: ApiErrorDto;
}
export class DeletedRecordDto {
  @ApiProperty() id!: string;
  @ApiProperty({enum:[true],type:Boolean}) deleted!: true;
}
export class BulkLayoutDto {
  @ApiProperty({type:[PlaceResponseDto]}) places!: PlaceResponseDto[];
  @ApiProperty({type:MapLayoutDto}) mapLayout!: MapLayoutDto;
}
export class CoreRoomDto {
  @ApiProperty() code!: string;
  @ApiProperty() nameTh!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() updatedAt!: string;
}
export class CorePersonOptionDto {
  @ApiProperty() personCode!: string;
  @ApiProperty() nameTh!: string;
  @ApiProperty() personnelType!: string;
}
export function ApiResult(model: Type, collection = false, status = 200) {
  return applyDecorators(
    ApiExtraModels(model, PaginationMetaDto, ApiEnvelopeDto, ApiErrorEnvelopeDto, ApiErrorDto),
    ApiResponse({status, schema:{type:'object',required:collection ? ['success','data','meta'] : ['success','data'],properties:{
      success:{type:'boolean',enum:[true]},
      data:collection ? {type:'array',items:{$ref:getSchemaPath(model)}} : {$ref:getSchemaPath(model)},
      ...(collection ? {meta:{$ref:getSchemaPath(PaginationMetaDto)}} : {}),
    }}}),
  );
}
