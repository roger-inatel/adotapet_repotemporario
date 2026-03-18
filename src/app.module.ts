import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PetsModule } from './modules/pets/pets.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [PrismaModule, PetsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
