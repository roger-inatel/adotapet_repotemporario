import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    try {
      return await this.prisma.organization.create({
        data: createOrganizationDto,
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  findAll() {
    return this.prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with id "${id}" was not found.`);
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    await this.ensureOrganizationExists(id);

    try {
      return await this.prisma.organization.update({
        where: { id },
        data: updateOrganizationDto,
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.ensureOrganizationExists(id);

    return this.prisma.organization.delete({
      where: { id },
    });
  }

  private async ensureOrganizationExists(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with id "${id}" was not found.`);
    }
  }

  private handleUniqueConstraint(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : String(error.meta?.target ?? '');

      if (target.includes('email')) {
        throw new BadRequestException('Email is already in use.');
      }

      if (target.includes('cnpj')) {
        throw new BadRequestException('CNPJ is already in use.');
      }

      throw new BadRequestException('Unique field already exists for organization.');
    }
  }
}
