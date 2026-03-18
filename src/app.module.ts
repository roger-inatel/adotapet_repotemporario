import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AdoptionsModule } from './modules/adoptions/adoptions.module';

@Module({
  imports: [PrismaModule, AdoptionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
