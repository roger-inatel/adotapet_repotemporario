import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdoptionRequestStatus, PetSize, PetStatus, Sex, Species } from '@prisma/client';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AdoptionsService } from '../../src/modules/adoptions/adoptions.service';
import { OrganizationsService } from '../../src/modules/organizations/organizations.service';
import { PetsService } from '../../src/modules/pets/pets.service';

describe('Core services (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let adoptionsService: AdoptionsService;
  let organizationsService: OrganizationsService;
  let petsService: PetsService;

  const runId = Date.now().toString();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [AdoptionsService, OrganizationsService, PetsService, PrismaService],
    }).compile();

    prisma = module.get(PrismaService);
    adoptionsService = module.get(AdoptionsService);
    organizationsService = module.get(OrganizationsService);
    petsService = module.get(PetsService);
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await module.close();
  });

  it('deve atualizar uma organizacao existente e persistir os novos dados', async () => {
    const organization = await organizationsService.create({
      legalName: 'ONG Integracao Atualizacao',
      email: `org-atualizacao-${runId}@adotapet.test`,
      city: 'Santa Rita do Sapucai',
      state: 'MG',
    });

    const result = await organizationsService.update(organization.id, {
      tradeName: 'ONG Atualizada',
      city: 'Pouso Alegre',
      state: 'MG',
      isVerified: true,
    });
    const persistedOrganization = await prisma.organization.findUniqueOrThrow({
      where: { id: organization.id },
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: organization.id,
        tradeName: 'ONG Atualizada',
        city: 'Pouso Alegre',
        state: 'MG',
        isVerified: true,
      }),
    );
    expect(persistedOrganization).toEqual(
      expect.objectContaining({
        tradeName: 'ONG Atualizada',
        city: 'Pouso Alegre',
        isVerified: true,
      }),
    );
  });

  it('deve listar pets filtrando por status e estado usando registros reais', async () => {
    const owner = await createUser('pets-filter-owner');
    const matchingPet = await prisma.pet.create({
      data: buildPetData(owner.id, {
        name: 'Pet Integracao Disponivel',
        status: PetStatus.AVAILABLE,
        state: 'MG',
      }),
    });

    await prisma.pet.create({
      data: buildPetData(owner.id, {
        name: 'Pet Integracao Adotado',
        status: PetStatus.ADOPTED,
        state: 'SP',
      }),
    });

    const result = await petsService.findAll({
      status: PetStatus.AVAILABLE,
      state: 'mg',
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: matchingPet.id,
          status: PetStatus.AVAILABLE,
          state: 'MG',
        }),
      ]),
    );
    expect(result).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: PetStatus.ADOPTED,
        }),
      ]),
    );
  });

  it('deve bloquear atualizacao de pet quando o usuario nao for o dono', async () => {
    const owner = await createUser('pet-owner');
    const otherUser = await createUser('pet-other-user');
    const pet = await prisma.pet.create({
      data: buildPetData(owner.id, {
        name: 'Pet Protegido Integracao',
        status: PetStatus.AVAILABLE,
      }),
    });

    await expect(
      petsService.update(pet.id, { name: 'Tentativa Indevida' }, otherUser.id),
    ).rejects.toThrow(new ForbiddenException('Voce nao tem permissao para alterar este pet.'));
  });

  it('deve salvar a URL da foto quando o dono atualiza a foto do pet', async () => {
    const owner = await createUser('pet-photo-owner');
    const pet = await prisma.pet.create({
      data: buildPetData(owner.id, {
        name: 'Pet Foto Integracao',
        status: PetStatus.AVAILABLE,
      }),
    });
    const photoUrl = `/uploads/pets/${pet.id}.jpg`;

    const result = await petsService.uploadPhoto(pet.id, owner.id, photoUrl);
    const persistedPet = await prisma.pet.findUniqueOrThrow({
      where: { id: pet.id },
    });

    expect(result.photoUrl).toBe(photoUrl);
    expect(persistedPet.photoUrl).toBe(photoUrl);
  });

  it('deve aprovar uma adocao e mudar o pet para PENDING_ADOPTION', async () => {
    const owner = await createUser('adoption-owner');
    const requester = await createUser('adoption-requester');
    const pet = await prisma.pet.create({
      data: buildPetData(owner.id, {
        name: 'Pet Para Adocao Integracao',
        status: PetStatus.AVAILABLE,
      }),
    });
    const adoption = await adoptionsService.create(
      {
        petId: pet.id,
        message: 'Tenho experiencia com pets.',
      },
      requester.id,
    );

    const result = await adoptionsService.updateStatus(
      adoption.id,
      { status: AdoptionRequestStatus.APPROVED },
      owner.id,
    );
    const persistedPet = await prisma.pet.findUniqueOrThrow({
      where: { id: pet.id },
    });

    expect(result.status).toBe(AdoptionRequestStatus.APPROVED);
    expect(persistedPet.status).toBe(PetStatus.PENDING_ADOPTION);
  });

  it('deve impedir criar solicitacao de adocao para pet indisponivel', async () => {
    const owner = await createUser('unavailable-adoption-owner');
    const requester = await createUser('unavailable-adoption-requester');
    const pet = await prisma.pet.create({
      data: buildPetData(owner.id, {
        name: 'Pet Indisponivel Integracao',
        status: PetStatus.ADOPTED,
      }),
    });

    await expect(
      adoptionsService.create(
        {
          petId: pet.id,
          message: 'Quero adotar este pet.',
        },
        requester.id,
      ),
    ).rejects.toThrow('Este pet n\u00e3o est\u00e1 dispon\u00edvel para ado\u00e7\u00e3o.');
  });

  async function createUser(label: string) {
    return prisma.user.create({
      data: {
        fullName: `Usuario ${label}`,
        email: `${label}-${runId}@adotapet.test`,
        password: 'senha-hash-teste',
        role: 'ADOPTER',
      },
    });
  }

  function buildPetData(
    registeredById: string,
    overrides: {
      name: string;
      status: PetStatus;
      state?: string;
    },
  ) {
    return {
      name: overrides.name,
      species: Species.DOG,
      breed: 'Sem raca definida',
      sex: Sex.MALE,
      ageInMonths: 24,
      size: PetSize.MEDIUM,
      status: overrides.status,
      city: 'Santa Rita do Sapucai',
      state: overrides.state ?? 'MG',
      registeredById,
    };
  }

  async function cleanupTestData() {
    await prisma.responsibilityTerm.deleteMany({
      where: {
        adoptionRequest: {
          OR: [
            { requester: { email: { contains: runId } } },
            { pet: { registeredBy: { email: { contains: runId } } } },
          ],
        },
      },
    });
    await prisma.adoptionRequest.deleteMany({
      where: {
        OR: [
          { requester: { email: { contains: runId } } },
          { pet: { registeredBy: { email: { contains: runId } } } },
        ],
      },
    });
    await prisma.pet.deleteMany({
      where: { registeredBy: { email: { contains: runId } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: runId } },
    });
    await prisma.organization.deleteMany({
      where: { email: { contains: runId } },
    });
  }
});
