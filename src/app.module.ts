import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PetsModule } from './modules/pets/pets.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdoptionsModule } from './modules/adoptions/adoptions.module';
import { ResponsibilityTermsModule } from './modules/responsibility-terms/responsibility-terms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PetsModule,
    UsersModule,
    OrganizationsModule,
    AuthModule,
    AdoptionsModule,
    ResponsibilityTermsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
