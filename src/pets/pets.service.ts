import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PetSize, PetStatus, Prisma, Sex, Species } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

type FindPetsFilters = {
  species?: string;
  size?: string;
  sex?: string;
  status?: string;
  breed?: string;
  name?: string;
  city?: string;
  state?: string;
  organizationId?: string;
  registeredById?: string;
};

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPetDto: CreatePetDto) {
    return this.prisma.pet.create({
      data: createPetDto,
    });
  }

  findAll(filters: FindPetsFilters) {
    const where: Prisma.PetWhereInput = {};

    const species = this.parseEnum(Species, filters.species, 'species');
    const size = this.parseEnum(PetSize, filters.size, 'size');
    const sex = this.parseEnum(Sex, filters.sex, 'sex');
    const status = this.parseEnum(PetStatus, filters.status, 'status');

    if (species) where.species = species;
    if (size) where.size = size;
    if (sex) where.sex = sex;
    if (status) where.status = status;

    if (filters.breed) {
      where.breed = { contains: filters.breed.trim() };
    }

    if (filters.name) {
      where.name = { contains: filters.name.trim() };
    }

    if (filters.city) {
      where.city = { contains: filters.city.trim() };
    }

    if (filters.state) {
      where.state = { equals: filters.state.trim().toUpperCase() };
    }

    if (filters.organizationId) {
      where.organizationId = filters.organizationId.trim();
    }

    if (filters.registeredById) {
      where.registeredById = filters.registeredById.trim();
    }

    return this.prisma.pet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
    });

    if (!pet) {
      throw new NotFoundException(`Pet with id "${id}" was not found.`);
    }

    return pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto) {
    await this.ensurePetExists(id);

    return this.prisma.pet.update({
      where: { id },
      data: updatePetDto,
    });
  }

  async remove(id: string) {
    await this.ensurePetExists(id);

    return this.prisma.pet.delete({
      where: { id },
    });
  }

  private async ensurePetExists(id: string) {
    const exists = await this.prisma.pet.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Pet with id "${id}" was not found.`);
    }
  }

  private parseEnum<T extends Record<string, string>>(
    enumType: T,
    value: string | undefined,
    fieldName: string,
  ): T[keyof T] | undefined {
    if (!value) return undefined;

    const normalized = value.trim().toUpperCase();
    const validValues = Object.values(enumType) as string[];

    if (!validValues.includes(normalized)) {
      throw new BadRequestException(
        `Invalid "${fieldName}" filter. Accepted values: ${validValues.join(', ')}`,
      );
    }

    return normalized as T[keyof T];
  }
}
