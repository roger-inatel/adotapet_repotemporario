import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PetSize, PetStatus, Sex, Species } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetsService } from './pets.service';

@ApiTags('Pets')
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pet' })
  create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Get()
  @ApiOperation({ summary: 'List pets with optional dynamic filters' })
  @ApiQuery({ name: 'species', required: false, enum: Species })
  @ApiQuery({ name: 'size', required: false, enum: PetSize })
  @ApiQuery({ name: 'sex', required: false, enum: Sex })
  @ApiQuery({ name: 'status', required: false, enum: PetStatus })
  @ApiQuery({ name: 'breed', required: false, type: String })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'state', required: false, type: String })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiQuery({ name: 'registeredById', required: false, type: String })
  findAll(
    @Query('species') species?: string,
    @Query('size') size?: string,
    @Query('sex') sex?: string,
    @Query('status') status?: string,
    @Query('breed') breed?: string,
    @Query('name') name?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('organizationId') organizationId?: string,
    @Query('registeredById') registeredById?: string,
  ) {
    return this.petsService.findAll({
      species,
      size,
      sex,
      status,
      breed,
      name,
      city,
      state,
      organizationId,
      registeredById,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find pet by id' })
  @ApiParam({ name: 'id', description: 'Pet cuid id' })
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pet by id' })
  @ApiParam({ name: 'id', description: 'Pet cuid id' })
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete pet by id' })
  @ApiParam({ name: 'id', description: 'Pet cuid id' })
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }
}
