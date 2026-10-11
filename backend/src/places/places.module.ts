import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PlacesController } from "./places.controller";
import { PlaceReferenceService } from './place-reference.service';
import { PlacesService } from "./places.service";

@Module({
  imports: [AuthModule],
  controllers: [PlacesController],
  providers: [PlacesService, PlaceReferenceService],
  exports: [PlacesService],
})
export class PlacesModule {}
