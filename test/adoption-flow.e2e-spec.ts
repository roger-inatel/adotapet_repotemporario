import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Fluxo de adocao (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let jwtToken = '';
  let userId = '';
  let petId = '';

  const email = `teste-e2e-${Date.now()}@email.com`;
  const password = 'Str0ng@Pass123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    await app.init();
  });

  it('1) deve criar um usuario de teste', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      fullName: 'Usuario Teste E2E',
      email,
      password,
      role: 'ADOPTER',
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    userId = response.body.id;
  });

  it('2) deve fazer login e retornar um token JWT', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password,
    });

    expect(response.status).toBe(201);
    expect(response.body.access_token).toBeDefined();
    jwtToken = response.body.access_token;
  });

  it('3) deve criar um pet usando Bearer token', async () => {
    const response = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: 'Thor E2E',
        species: 'DOG',
        sex: 'MALE',
        size: 'SMALL',
        description: 'Pet criado no teste e2e',
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.registeredById).toBe(userId);
    petId = response.body.id;
  });

  afterAll(async () => {
    if (petId) {
      await prisma.pet
        .delete({
          where: { id: petId },
        })
        .catch(() => undefined);
    }

    if (userId) {
      await prisma.user
        .delete({
          where: { id: userId },
        })
        .catch(() => undefined);
    }

    await app.close();
  });
});
