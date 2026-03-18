import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PetsModule } from './modules/pets/pets.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';

@Module({
  imports: [PrismaModule, PetsModule, UsersModule, OrganizationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
