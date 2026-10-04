import { ApiResult, PlaceResponseDto, MapLayoutDto, DashboardStatsDto, DeletedRecordDto, BulkLayoutDto, CoreRoomDto } from '../contracts/map-contract.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
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
  CreatePlaceDto,
  PlaceListQueryDto,
  SearchPlaceQueryDto,
  UpdatePlacesLayoutDto,
  UpdatePlaceDto,
} from "./dto/place.dto";
import { PlacesService } from "./places.service";

@ApiTags("places")
@ApiBearerAuth("core-hub-bearer")
@Controller("v1/places")
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get()
  @ApiResult(PlaceResponseDto, true)
  @RequirePermissions(Permission.PLACE_READ)
  @ApiOperation({ summary: "List and optionally filter places" })
  async findAll(@Query() query: PlaceListQueryDto, @CoreHubAccessToken() token: string) {
    const result = await this.places.findAll(query, token);
    return paginated(result.data, query.page, query.limit, result.total);
  }

  @Get("search")
  @ApiResult(PlaceResponseDto, true)
  @RequirePermissions(Permission.PLACE_READ)
  @ApiOperation({ summary: "Search places by room, keyword, or lecturer" })
  async search(@Query() query: SearchPlaceQueryDto, @CoreHubAccessToken() token: string) {
    const result = await this.places.search(query, token);
    return paginated(result.data, query.page, query.limit, result.total);
  }

  @Get("admin-list")
  @ApiResult(PlaceResponseDto, true)
  @ApiBearerAuth("core-hub-bearer")
  @RequirePermissions(Permission.PLACE_UPDATE)
  @ApiOperation({
    summary: "List active and inactive places for administration",
  })
  async adminList(@Query() query: PlaceListQueryDto, @CoreHubAccessToken() token: string) {
    const result = await this.places.findAll(query, token, true);
    return paginated(result.data, query.page, query.limit, result.total);
  }

  @Get("stats")
  @ApiResult(DashboardStatsDto)
  @ApiBearerAuth("core-hub-bearer")
  @RequirePermissions(Permission.PLACE_UPDATE)
  @ApiOperation({ summary: "Return dashboard counts for editors and admins" })
  async stats() {
    return success(await this.places.stats());
  }

  @Get("layout-config")
  @ApiResult(MapLayoutDto)
  @RequirePermissions(Permission.PLACE_READ)
  @ApiOperation({ summary: "Return the editable map corridor layout" })
  async mapLayout() {
    return success(await this.places.getMapLayout());
  }

  @Get('core-rooms')
  @ApiResult(CoreRoomDto, true)
  @RequirePermissions(Permission.PLACE_READ)
  async coreRooms(@Query() query: PaginationQueryDto, @CoreHubAccessToken() token: string) {
    const rooms = await this.places.availableRooms(token);
    return paginated(rooms.slice((query.page - 1) * query.limit, query.page * query.limit), query.page, query.limit, rooms.length);
  }

  @Get(":id")
  @ApiResult(PlaceResponseDto)
  @RequirePermissions(Permission.PLACE_READ)
  @ApiOperation({ summary: "Get a place by UUID" })
  async findOne(@Param("id", ParseUUIDPipe) id: string, @CoreHubAccessToken() token: string) {
    return success(await this.places.findOne(id, token));
  }

  @Post()
  @ApiResult(PlaceResponseDto, false, 201)
  @ApiBearerAuth("core-hub-bearer")
  @RequirePermissions(Permission.PLACE_CREATE)
  @ApiOperation({ summary: "Create a place (editor or admin)" })
  async create(@Body() dto: CreatePlaceDto, @CoreHubAccessToken() token: string) {
    return success(await this.places.create(dto, token));
  }

  @Patch("layout")
  @ApiResult(BulkLayoutDto)
  @ApiBearerAuth("core-hub-bearer")
  @RequirePermissions(Permission.PLACE_UPDATE)
  @ApiOperation({ summary: "Update positions and sizes for multiple places" })
  async updateLayout(@Body() dto: UpdatePlacesLayoutDto, @CoreHubAccessToken() token: string) {
    return success(await this.places.updateLayout(dto, token));
  }

  @Patch(":id")
  @ApiResult(PlaceResponseDto)
  @ApiBearerAuth("core-hub-bearer")
  @RequirePermissions(Permission.PLACE_UPDATE)
  @ApiOperation({ summary: "Update a place (editor or admin)" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlaceDto,
    @CoreHubAccessToken() token: string,
  ) {
    return success(await this.places.update(id, dto, token));
  }

  @Delete(":id")
  @ApiResult(DeletedRecordDto)
  @ApiBearerAuth("core-hub-bearer")
  @HttpCode(200)
  @RequirePermissions(Permission.PLACE_DELETE)
  @ApiOperation({ summary: "Delete a place (admin only)" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return success(await this.places.remove(id));
  }
}
