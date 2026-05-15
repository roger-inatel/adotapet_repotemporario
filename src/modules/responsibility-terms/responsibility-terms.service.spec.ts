import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdoptionRequestStatus, PetStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { ResponsibilityTermsService } from './responsibility-terms.service';

describe('ResponsibilityTermsService', () => {
  let service: ResponsibilityTermsService;

  const prismaMock = {
    adoptionRequest: {
      findUnique: jest.fn(),
    },
    responsibilityTerm: {
      create: jest.fn(),
    },
    pet: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponsibilityTermsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ResponsibilityTermsService>(ResponsibilityTermsService);
  });

  it('deve mudar o status do pet para ADOPTED ao assinar o termo', async () => {
    const term = {
      id: 'term-1',
      adoptionRequestId: 'adocao-1',
      adopterIp: '127.0.0.1',
      userAgent: 'jest',
    };

    prismaMock.adoptionRequest.findUnique.mockResolvedValue({
      id: 'adocao-1',
      requesterId: 'user-1',
      petId: 'pet-1',
      status: AdoptionRequestStatus.APPROVED,
      responsibilityTerm: null,
      pet: { id: 'pet-1' },
    });
    prismaMock.responsibilityTerm.create.mockReturnValue(term);
    prismaMock.pet.update.mockReturnValue({
      id: 'pet-1',
      status: PetStatus.ADOPTED,
    });
    prismaMock.$transaction.mockResolvedValue([term]);

    const result = await service.signTerm('adocao-1', { id: 'user-1' }, '127.0.0.1', 'jest');

    expect(prismaMock.pet.update).toHaveBeenCalledWith({
      where: { id: 'pet-1' },
      data: { status: PetStatus.ADOPTED },
    });
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(result).toEqual(term);
  });

  it('deve registrar o IP do adotante ao assinar o termo', async () => {
    const signerIp = '192.168.0.25';

    prismaMock.adoptionRequest.findUnique.mockResolvedValue({
      id: 'adocao-2',
      requesterId: 'user-2',
      petId: 'pet-2',
      status: AdoptionRequestStatus.APPROVED,
      responsibilityTerm: null,
      pet: { id: 'pet-2' },
    });
    prismaMock.responsibilityTerm.create.mockReturnValue({
      id: 'term-2',
      adoptionRequestId: 'adocao-2',
      adopterIp: signerIp,
      userAgent: 'jest',
    });
    prismaMock.pet.update.mockReturnValue({
      id: 'pet-2',
      status: PetStatus.ADOPTED,
    });
    prismaMock.$transaction.mockResolvedValue([
      {
        id: 'term-2',
        adoptionRequestId: 'adocao-2',
        adopterIp: signerIp,
        userAgent: 'jest',
      },
    ]);

    await service.signTerm('adocao-2', { id: 'user-2' }, signerIp, 'jest');

    expect(prismaMock.responsibilityTerm.create).toHaveBeenCalledWith({
      data: {
        adoptionRequestId: 'adocao-2',
        adopterIp: signerIp,
        userAgent: 'jest',
      },
    });
  });

  it('deve retornar 400 ao assinar termo com adocao nao aprovada', async () => {
    prismaMock.adoptionRequest.findUnique.mockResolvedValue({
      id: 'adocao-3',
      requesterId: 'user-3',
      petId: 'pet-3',
      status: AdoptionRequestStatus.PENDING,
      responsibilityTerm: null,
      pet: { id: 'pet-3' },
    });

    await expect(
      service.signTerm('adocao-3', { id: 'user-3' }, '127.0.0.1', 'jest'),
    ).rejects.toThrow(
      new BadRequestException('A solicitacao precisa estar aprovada para assinatura.'),
    );

    expect(prismaMock.responsibilityTerm.create).not.toHaveBeenCalled();
    expect(prismaMock.pet.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('deve retornar 404 ao assinar termo de solicitacao inexistente', async () => {
    prismaMock.adoptionRequest.findUnique.mockResolvedValue(null);

    await expect(
      service.signTerm('adocao-inexistente', { id: 'user-1' }, '127.0.0.1', 'jest'),
    ).rejects.toThrow(new NotFoundException('Solicitacao de adocao nao encontrada.'));

    expect(prismaMock.responsibilityTerm.create).not.toHaveBeenCalled();
    expect(prismaMock.pet.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('deve impedir assinatura por usuario diferente do solicitante', async () => {
    prismaMock.adoptionRequest.findUnique.mockResolvedValue({
      id: 'adocao-4',
      requesterId: 'user-solicitante',
      petId: 'pet-4',
      status: AdoptionRequestStatus.APPROVED,
      responsibilityTerm: null,
      pet: { id: 'pet-4' },
    });

    await expect(
      service.signTerm('adocao-4', { id: 'user-outro' }, '127.0.0.1', 'jest'),
    ).rejects.toThrow(
      new ForbiddenException('Apenas o adotante dono da solicitacao pode assinar o termo.'),
    );

    expect(prismaMock.responsibilityTerm.create).not.toHaveBeenCalled();
    expect(prismaMock.pet.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('deve impedir assinatura duplicada do termo', async () => {
    prismaMock.adoptionRequest.findUnique.mockResolvedValue({
      id: 'adocao-5',
      requesterId: 'user-5',
      petId: 'pet-5',
      status: AdoptionRequestStatus.APPROVED,
      responsibilityTerm: { id: 'term-existente' },
      pet: { id: 'pet-5' },
    });

    await expect(
      service.signTerm('adocao-5', { id: 'user-5' }, '127.0.0.1', 'jest'),
    ).rejects.toThrow(new BadRequestException('Ja existe termo assinado para esta solicitacao.'));

    expect(prismaMock.responsibilityTerm.create).not.toHaveBeenCalled();
    expect(prismaMock.pet.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
