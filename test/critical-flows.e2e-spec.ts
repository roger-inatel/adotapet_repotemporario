import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdoptionRequestStatus, PetStatus } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Fluxos criticos (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const runId = Date.now().toString();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  it('deve bloquear criacao de pet sem token JWT', async () => {
    const response = await request(app.getHttpServer()).post('/pets').send({
      name: 'Pet Sem Token',
      species: 'DOG',
      sex: 'MALE',
    });

    expect(response.status).toBe(401);
  });

  it('deve impedir usuario ADOPTER de listar todos os usuarios', async () => {
    const { token } = await createUserAndLogin('rbac-adopter');

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('deve completar fluxo de adocao ate assinatura do termo', async () => {
    const owner = await createUserAndLogin('full-flow-owner');
    const adopter = await createUserAndLogin('full-flow-adopter');

    const petResponse = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        name: 'Pet Fluxo Completo E2E',
        species: 'DOG',
        sex: 'FEMALE',
        size: 'MEDIUM',
        status: PetStatus.AVAILABLE,
      });

    expect(petResponse.status).toBe(201);
    expect(petResponse.body.registeredById).toBe(owner.userId);

    const adoptionResponse = await request(app.getHttpServer())
      .post('/adoptions')
      .set('Authorization', `Bearer ${adopter.token}`)
      .send({
        petId: petResponse.body.id,
        message: 'Tenho estrutura para adotar.',
      });

    expect(adoptionResponse.status).toBe(201);
    expect(adoptionResponse.body.status).toBe(AdoptionRequestStatus.PENDING);

    const approvalResponse = await request(app.getHttpServer())
      .patch(`/adoptions/${adoptionResponse.body.id}/status`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: AdoptionRequestStatus.APPROVED });

    expect(approvalResponse.status).toBe(200);
    expect(approvalResponse.body.status).toBe(AdoptionRequestStatus.APPROVED);

    const termResponse = await request(app.getHttpServer())
      .post(`/responsibility-terms/${adoptionResponse.body.id}/sign`)
      .set('Authorization', `Bearer ${adopter.token}`);

    expect(termResponse.status).toBe(201);
    expect(termResponse.body.adoptionRequestId).toBe(adoptionResponse.body.id);

    const petAfterTerm = await request(app.getHttpServer()).get(`/pets/${petResponse.body.id}`);

    expect(petAfterTerm.status).toBe(200);
    expect(petAfterTerm.body.status).toBe(PetStatus.ADOPTED);
  });

  async function createUserAndLogin(label: string) {
    const email = `${label}-${runId}@adotapet.test`;
    const password = 'Str0ng@Pass123';

    const createResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: `Usuario ${label}`,
        email,
        password,
        role: 'ADOPTER',
      });

    expect(createResponse.status).toBe(201);

    const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password,
    });

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.body.access_token).toBeDefined();

    return {
      email,
      userId: createResponse.body.id as string,
      token: loginResponse.body.access_token as string,
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
  }
});
