import { ApiResult, LecturerResponseDto, DeletedRecordDto, CorePersonOptionDto } from '../contracts/map-contract.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Permission } from "../auth/permissions";
import { CoreHubAccessToken } from '../auth/decorators/core-hub-access-token.decorator';
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { paginated, success } from "../common/types/api-response";
import {
  CreateLecturerDto,
  LecturerListQueryDto,
  SearchLecturerQueryDto,
  UpdateLecturerDto,
} from "./dto/lecturer.dto";
import { LecturersService } from "./lecturers.service";

@ApiTags("lecturers")
@ApiBearerAuth("core-hub-bearer")
@Controller("v1/lecturers")
export class LecturersController {
  constructor(private readonly lecturers: LecturersService) {}

  @Get()
  @ApiResult(LecturerResponseDto, true)
  @Header("Cache-Control", "no-store")
  @RequirePermissions(Permission.LECTURER_READ)
  @ApiOperation({ summary: "List lecturers with their assigned offices" })
  async findAll(@Query() query: LecturerListQueryDto, @CoreHubAccessToken() token: string) {
    const result = await this.lecturers.findAll(query, token);
    return paginated(result.data, query.page, query.limit, result.total);
  }

  @Get("search")
  @ApiResult(LecturerResponseDto, true)
  @Header("Cache-Control", "no-store")
  @RequirePermissions(Permission.LECTURER_READ)
  @ApiOperation({ summary: "Search lecturers by partial name or email" })
  async search(@Query() query: SearchLecturerQueryDto, @CoreHubAccessToken() token: string) {
    const result = await this.lecturers.findAll(query, token);
    return paginated(result.data, query.page, query.limit, result.total);
  }

  @Get('core-people')
  @ApiResult(CorePersonOptionDto, true)
  @Header('Cache-Control','no-store')
  @RequirePermissions(Permission.LECTURER_READ)
  async corePeople(@Query() query: LecturerListQueryDto, @CoreHubAccessToken() token: string) {
    const result = await this.lecturers.availablePeople(query,token);
    return paginated(result.data,query.page,query.limit,result.total);
  }

  @Post()
  @ApiResult(LecturerResponseDto, false, 201)
  @Header('Cache-Control','no-store')
  @ApiBearerAuth("core-hub-bearer")
  @RequirePermissions(Permission.LECTURER_CREATE)
  async create(@Body() dto: CreateLecturerDto, @CoreHubAccessToken() token: string) {
    return success(await this.lecturers.create(dto, token));
  }

  @Patch(":id")
  @ApiResult(LecturerResponseDto)
  @Header("Cache-Control", "no-store")
  @ApiBearerAuth("core-hub-bearer")
  @RequirePermissions(Permission.LECTURER_UPDATE)
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateLecturerDto,
    @CoreHubAccessToken() token: string,
  ) {
    return success(await this.lecturers.update(id, dto, token));
  }

  @Delete(":id")
  @ApiResult(DeletedRecordDto)
  @ApiBearerAuth("core-hub-bearer")
  @HttpCode(200)
  @RequirePermissions(Permission.LECTURER_DELETE)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return success(await this.lecturers.remove(id));
  }
}
