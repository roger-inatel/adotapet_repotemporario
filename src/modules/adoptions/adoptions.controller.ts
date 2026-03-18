import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdoptionsService } from './adoptions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { UpdateAdoptionStatusDto } from './dto/update-adoption-status.dto';

@ApiTags('Adoptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('adoptions')
export class AdoptionsController {
  constructor(private readonly adoptionsService: AdoptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an adoption request' })
  create(
    @Body() createAdoptionDto: CreateAdoptionDto,
    @CurrentUser() user: any,
  ) {
    return this.adoptionsService.create(createAdoptionDto, user.id);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'List adoption requests created by logged user' })
  findMyRequests(@CurrentUser() user: any) {
    return this.adoptionsService.findMyRequests(user.id);
  }

  @Get('received')
  @ApiOperation({ summary: 'List adoption requests received by logged user' })
  findReceived(@CurrentUser() user: any) {
    return this.adoptionsService.findReceivedRequests(user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update adoption request status' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdoptionStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.adoptionsService.updateStatus(id, updateDto, user.id);
  }
}
