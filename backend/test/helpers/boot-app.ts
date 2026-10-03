import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ROUTES_OUTSIDE_API_PREFIX, configureApp } from '../../src/app-setup';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { InMemoryPrisma } from './in-memory-prisma';
export async function bootApp(db:InMemoryPrisma, env:Record<string,string>={}):Promise<INestApplication> {
  const previous=new Map(Object.keys(env).map(key=>[key,process.env[key]]));Object.assign(process.env,env);
  try {
    const moduleRef=await Test.createTestingModule({imports:[AppModule]}).overrideProvider(PrismaService).useValue(db).compile();
    const app=moduleRef.createNestApplication();
    app.setGlobalPrefix('api',{exclude:ROUTES_OUTSIDE_API_PREFIX});configureApp(app);
    app.useGlobalFilters(new AllExceptionsFilter());app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();return app;
  } finally { for(const [key,value] of previous) {if(value===undefined)delete process.env[key];else process.env[key]=value;} }
}
