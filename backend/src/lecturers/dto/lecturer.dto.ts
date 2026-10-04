import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';
import { PersonnelType } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export class CreateLecturerDto {
  @ApiProperty({ description: 'personCode จาก Core Hub' })
  @IsString() @Length(1, 100) personCode!: string;
  @ApiPropertyOptional({type:String, format:'uuid', nullable:true})
  @IsOptional() @IsUUID() placeId?: string | null;
}
export class UpdateLecturerDto extends PartialType(CreateLecturerDto) {}
export class LecturerListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) q?: string;
  @ApiPropertyOptional({enum:PersonnelType}) @IsOptional() @IsEnum(PersonnelType) personnelType?: PersonnelType;
}
export class SearchLecturerQueryDto extends LecturerListQueryDto {
  @ApiProperty() @IsString() @Length(1,100) declare q: string;
}
