import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdoptionRequestStatus, PetStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AdoptionsService } from './adoptions.service';

describe('AdoptionsService', () => {
  let service: AdoptionsService;

  const prismaMock = {
    adoptionRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pet: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdoptionsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AdoptionsService>(AdoptionsService);
  });

  it('deve aprovar a adocao e mudar o pet para PENDING_ADOPTION', async () => {
    const adoptionUpdated = {
      id: 'adocao-1',
      petId: 'pet-1',
      status: AdoptionRequestStatus.APPROVED,
    };

    prismaMock.adoptionRequest.findUnique.mockResolvedValue({
      id: 'adocao-1',
      petId: 'pet-1',
      pet: {
        id: 'pet-1',
        registeredById: 'user-1',
      },
    });
    prismaMock.adoptionRequest.update.mockReturnValue(adoptionUpdated);
    prismaMock.pet.update.mockReturnValue({
      id: 'pet-1',
      status: PetStatus.PENDING_ADOPTION,
    });
    prismaMock.$transaction.mockResolvedValue([adoptionUpdated]);

    const result = await service.updateStatus(
      'adocao-1',
      { status: AdoptionRequestStatus.APPROVED },
      'user-1',
    );

    expect(prismaMock.adoptionRequest.update).toHaveBeenCalledWith({
      where: { id: 'adocao-1' },
      data: {
        status: AdoptionRequestStatus.APPROVED,
        reviewedAt: expect.any(Date),
      },
    });
    expect(prismaMock.pet.update).toHaveBeenCalledWith({
      where: { id: 'pet-1' },
      data: { status: PetStatus.PENDING_ADOPTION },
    });
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(result).toEqual(adoptionUpdated);
  });

  it('deve retornar 404 ao solicitar adocao de pet inexistente', async () => {
    prismaMock.pet.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ petId: 'pet-inexistente', message: 'Quero adotar' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.adoptionRequest.create).not.toHaveBeenCalled();
  });

  it('deve impedir solicitacao de adocao para pet indisponivel', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({
      id: 'pet-1',
      status: PetStatus.ADOPTED,
    });

    await expect(service.create({ petId: 'pet-1' }, 'user-1')).rejects.toThrow(BadRequestException);

    expect(prismaMock.adoptionRequest.create).not.toHaveBeenCalled();
  });

  it('deve criar solicitacao de adocao pendente para pet disponivel', async () => {
    prismaMock.pet.findUnique.mockResolvedValue({
      id: 'pet-1',
      status: PetStatus.AVAILABLE,
    });
    prismaMock.adoptionRequest.create.mockResolvedValue({
      id: 'adocao-1',
      petId: 'pet-1',
      requesterId: 'user-1',
      status: AdoptionRequestStatus.PENDING,
    });

    await service.create({ petId: 'pet-1', message: 'Tenho experiencia' }, 'user-1');

    expect(prismaMock.adoptionRequest.create).toHaveBeenCalledWith({
      data: {
        petId: 'pet-1',
        requesterId: 'user-1',
        message: 'Tenho experiencia',
        status: AdoptionRequestStatus.PENDING,
      },
      include: { pet: true },
    });
  });

  it('deve impedir alteracao de status por usuario que nao cadastrou o pet', async () => {
    prismaMock.adoptionRequest.findUnique.mockResolvedValue({
      id: 'adocao-1',
      petId: 'pet-1',
      pet: {
        id: 'pet-1',
        registeredById: 'user-dono',
      },
    });

    await expect(
      service.updateStatus('adocao-1', { status: AdoptionRequestStatus.REJECTED }, 'user-outro'),
    ).rejects.toThrow(ForbiddenException);

    expect(prismaMock.adoptionRequest.update).not.toHaveBeenCalled();
    expect(prismaMock.pet.update).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
