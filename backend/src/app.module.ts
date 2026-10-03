import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { CoreHubJwtGuard } from "./auth/guards/core-hub-jwt.guard";
import { PermissionsGuard } from "./auth/guards/permissions.guard";
import { HealthModule } from "./health/health.module";
import { LecturersModule } from "./lecturers/lecturers.module";
import { PlacesModule } from "./places/places.module";
import { PrismaModule } from "./prisma/prisma.module";
import configuration from './config/configuration';
import { CoreHubModule } from './core-hub/core-hub.module';
import { validateEnvironment } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [".env", "../.env"],
      validate: validateEnvironment,
    }),
    PrismaModule,
    AuthModule,
    CoreHubModule,
    HealthModule,
    PlacesModule,
    LecturersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: CoreHubJwtGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
