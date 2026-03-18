import {
  Controller,
  Headers,
  Ip,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResponsibilityTermsService } from './responsibility-terms.service';

@ApiTags('Responsibility Terms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADOPTER)
@Controller('responsibility-terms')
export class ResponsibilityTermsController {
  constructor(private readonly responsibilityTermsService: ResponsibilityTermsService) {}

  @Post(':adoptionRequestId/sign')
  @ApiOperation({ summary: 'Sign responsibility term for an approved adoption' })
  signTerm(
    @Param('adoptionRequestId') reqId: string,
    @CurrentUser() user: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.responsibilityTermsService.signTerm(reqId, user, ip, userAgent);
  }
}
