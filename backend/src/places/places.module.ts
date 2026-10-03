import { Module } from "@nestjs/common";
import { CoreHubModule } from '../core-hub/core-hub.module';
import { AuthModule } from "../auth/auth.module";
import { PlacesController } from "./places.controller";
import { PlaceReferenceService } from './place-reference.service';
import { PlacesService } from "./places.service";

@Module({
  imports: [AuthModule, CoreHubModule],
  controllers: [PlacesController],
  providers: [PlacesService, PlaceReferenceService],
  exports: [PlacesService],
})
export class PlacesModule {}
