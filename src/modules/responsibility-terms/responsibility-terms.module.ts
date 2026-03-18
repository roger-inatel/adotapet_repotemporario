import { Module } from '@nestjs/common';
import { ResponsibilityTermsService } from './responsibility-terms.service';
import { ResponsibilityTermsController } from './responsibility-terms.controller';

@Module({
  controllers: [ResponsibilityTermsController],
  providers: [ResponsibilityTermsService],
})
export class ResponsibilityTermsModule {}
