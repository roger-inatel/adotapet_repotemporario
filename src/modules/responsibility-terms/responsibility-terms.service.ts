import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdoptionRequestStatus, PetStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResponsibilityTermsService {
  constructor(private readonly prisma: PrismaService) {}

  async signTerm(adoptionRequestId: string, user: { id: string }, ip: string, userAgent: string) {
    const adoptionRequest = await this.prisma.adoptionRequest.findUnique({
      where: { id: adoptionRequestId },
      include: {
        pet: true,
        responsibilityTerm: true,
      },
    });

    if (!adoptionRequest) {
      throw new NotFoundException('Solicitacao de adocao nao encontrada.');
    }

    if (adoptionRequest.requesterId !== user.id) {
      throw new ForbiddenException('Apenas o adotante dono da solicitacao pode assinar o termo.');
    }

    if (adoptionRequest.status !== AdoptionRequestStatus.APPROVED) {
      throw new BadRequestException('A solicitacao precisa estar aprovada para assinatura.');
    }

    if (adoptionRequest.responsibilityTerm) {
      throw new BadRequestException('Ja existe termo assinado para esta solicitacao.');
    }

    const [term] = await this.prisma.$transaction([
      this.prisma.responsibilityTerm.create({
        data: {
          adoptionRequestId,
          adopterIp: ip,
          userAgent: userAgent ?? 'unknown',
        },
      }),
      this.prisma.pet.update({
        where: { id: adoptionRequest.petId },
        data: { status: PetStatus.ADOPTED },
      }),
    ]);

    return term;
  }
}
