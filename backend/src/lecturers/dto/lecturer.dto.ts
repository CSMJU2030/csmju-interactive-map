import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from "class-validator";
import { PersonnelType } from "@prisma/client";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
export class CreateLecturerDto {
  @ApiProperty({ description: "รหัสบุคลากรที่ผู้ดูแลกำหนด" })
  @IsString()
  @Length(1, 100)
  personCode!: string;
  @ApiProperty() @IsString() @Length(1, 150) nameTh!: string;
  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nameEn?: string | null;
  @ApiPropertyOptional({ enum: PersonnelType })
  @IsOptional()
  @IsEnum(PersonnelType)
  personnelType?: PersonnelType;
  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;
  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  positionAcademic?: string | null;
  @ApiPropertyOptional({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  positionManager?: string | null;
  @ApiPropertyOptional({ type: String, format: "uuid", nullable: true })
  @IsOptional()
  @IsUUID()
  placeId?: string | null;
}
export class UpdateLecturerDto extends PartialType(CreateLecturerDto) {}
export class LecturerListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) q?: string;
  @ApiPropertyOptional({ enum: PersonnelType })
  @IsOptional()
  @IsEnum(PersonnelType)
  personnelType?: PersonnelType;
}
export class SearchLecturerQueryDto extends LecturerListQueryDto {
  @ApiProperty() @IsString() @Length(1, 100) declare q: string;
}
