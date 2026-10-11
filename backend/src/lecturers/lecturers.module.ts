import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { LecturersController } from "./lecturers.controller";
import { LecturersService } from "./lecturers.service";

@Module({
  imports: [AuthModule],
  controllers: [LecturersController],
  providers: [LecturersService],
})
export class LecturersModule {}
