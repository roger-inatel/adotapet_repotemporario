import { AdoptionRequestStatus, PetStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AdoptionsService } from './adoptions.service';

describe('AdoptionsService', () => {
  let service: AdoptionsService;

  const prismaMock = {
    adoptionRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
});
