import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  const prismaMock = {
    organization: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('deve retornar erro ao criar uma ONG com CNPJ ja existente', async () => {
    prismaMock.organization.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['cnpj'] },
      }),
    );

    await expect(
      service.create({
        legalName: 'Instituto Teste',
        email: 'ong@email.com',
        cnpj: '12345678000190',
      }),
    ).rejects.toThrow(new BadRequestException('CNPJ is already in use.'));
  });
});
