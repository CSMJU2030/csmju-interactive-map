import { Module } from "@nestjs/common";
import { CoreHubModule } from '../core-hub/core-hub.module';
import { PlaceReferenceService } from '../places/place-reference.service';
import { AuthModule } from "../auth/auth.module";
import { LecturersController } from "./lecturers.controller";
import { LecturersService } from "./lecturers.service";

@Module({
  imports: [AuthModule, CoreHubModule],
  controllers: [LecturersController],
  providers: [LecturersService, PlaceReferenceService],
})
export class LecturersModule {}
