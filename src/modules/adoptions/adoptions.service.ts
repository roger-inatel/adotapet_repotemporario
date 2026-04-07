import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdoptionRequestStatus, PetStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { UpdateAdoptionStatusDto } from './dto/update-adoption-status.dto';

@Injectable()
export class AdoptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdoptionDto: CreateAdoptionDto, requesterId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: createAdoptionDto.petId },
      select: { id: true, status: true },
    });

    if (!pet) {
      throw new NotFoundException('Pet não encontrado.');
    }

    if (pet.status !== PetStatus.AVAILABLE) {
      throw new BadRequestException('Este pet não está disponível para adoção.');
    }

    return this.prisma.adoptionRequest.create({
      data: {
        petId: createAdoptionDto.petId,
        requesterId,
        message: createAdoptionDto.message,
        status: AdoptionRequestStatus.PENDING,
      },
      include: { pet: true },
    });
  }

  findMyRequests(userId: string) {
    return this.prisma.adoptionRequest.findMany({
      where: { requesterId: userId },
      include: { pet: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findReceivedRequests(userId: string) {
    return this.prisma.adoptionRequest.findMany({
      where: { pet: { registeredById: userId } },
      include: {
        pet: true,
        requester: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(adoptionId: string, updateDto: UpdateAdoptionStatusDto, userId: string) {
    const adoption = await this.prisma.adoptionRequest.findUnique({
      where: { id: adoptionId },
      include: {
        pet: {
          select: { id: true, registeredById: true },
        },
      },
    });

    if (!adoption) {
      throw new NotFoundException('Solicitação de adoção não encontrada.');
    }

    if (adoption.pet.registeredById !== userId) {
      throw new ForbiddenException('Você não tem permissão para alterar esta solicitação.');
    }

    if (updateDto.status === AdoptionRequestStatus.APPROVED) {
      const [updatedAdoption] = await this.prisma.$transaction([
        this.prisma.adoptionRequest.update({
          where: { id: adoptionId },
          data: {
            status: AdoptionRequestStatus.APPROVED,
            reviewedAt: new Date(),
          },
        }),
        this.prisma.pet.update({
          where: { id: adoption.petId },
          data: { status: PetStatus.PENDING_ADOPTION },
        }),
      ]);

      return updatedAdoption;
    }

    return this.prisma.adoptionRequest.update({
      where: { id: adoptionId },
      data: {
        status: updateDto.status,
        reviewedAt: new Date(),
      },
    });
  }
}
