import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { PlaceCategory } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsInt,
  Matches,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

export class TeachingSessionInputDto {
  @ApiProperty({format:'uuid'}) @IsUUID() lecturerId!: string;
  @ApiProperty({minimum:0,maximum:6}) @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @ApiProperty({example:'09:00'}) @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) startTime!: string;
  @ApiProperty({example:'12:00'}) @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) endTime!: string;
  @ApiProperty({example:'2026-06-01'}) @Matches(/^\d{4}-\d{2}-\d{2}$/) validFrom!: string;
  @ApiProperty({example:'2026-10-31'}) @Matches(/^\d{4}-\d{2}-\d{2}$/) validUntil!: string;
  @ApiProperty() @IsString() @Length(1,150) courseName!: string;
}

export class CreatePlaceDto {
  @ApiPropertyOptional({type:[TeachingSessionInputDto]})
  @IsOptional() @IsArray() @ArrayMaxSize(100) @ValidateNested({each:true}) @Type(() => TeachingSessionInputDto)
  teachingSchedule?: TeachingSessionInputDto[];
  @ApiPropertyOptional({ example: "LAB-03" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  roomCode?: string;

  @ApiPropertyOptional({ description: "ชื่อห้องหรือสถานที่ที่แก้ไขได้ในระบบ" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nameTh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ enum: PlaceCategory })
  @IsEnum(PlaceCategory)
  category!: PlaceCategory;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  positionX!: number;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  positionY!: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(100)
  width?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(100)
  height?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [String], maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  keywords?: string[];
}

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {}

export class PlaceLayoutItemDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  id!: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  positionX!: number;

  @ApiProperty({ minimum: 0, maximum: 60 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(60)
  positionY!: number;

  @ApiProperty({ minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(100)
  width!: number;

  @ApiProperty({ minimum: 1, maximum: 60 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(60)
  height!: number;
}

export class CorridorPointDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  x!: number;

  @ApiProperty({ minimum: 0, maximum: 60 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(60)
  y!: number;
}

export class UpdateCorridorDto {
  @ApiProperty({ type: [CorridorPointDto], minItems: 2, maxItems: 20 })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CorridorPointDto)
  corridorPoints!: CorridorPointDto[];

  @ApiProperty({ minimum: 1, maximum: 12 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(12)
  corridorWidth!: number;
}

export class UpdatePlacesLayoutDto {
  @ApiPropertyOptional({ type: [PlaceLayoutItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PlaceLayoutItemDto)
  items?: PlaceLayoutItemDto[];

  @ApiPropertyOptional({ type: UpdateCorridorDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCorridorDto)
  corridor?: UpdateCorridorDto;
}

export class PlaceListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      "Partial match across names, room code, lecturers, and keywords",
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ enum: PlaceCategory })
  @IsOptional()
  @IsEnum(PlaceCategory)
  category?: PlaceCategory;
}

export class SearchPlaceQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: "lab" })
  @IsString()
  @Length(1, 100)
  q!: string;
}
