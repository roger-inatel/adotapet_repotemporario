import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Organizations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let organizationId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    await app.init();
  });

  it('deve buscar uma organizacao existente por id', async () => {
    const timestamp = Date.now();
    const organization = await prisma.organization.create({
      data: {
        legalName: 'Instituto Integracao Teste',
        tradeName: 'ONG Integracao',
        email: `integracao-${timestamp}@adotapet.org.br`,
        cnpj: String(timestamp).padStart(14, '0'),
        city: 'Santa Rita do Sapucai',
        state: 'MG',
      },
    });
    organizationId = organization.id;

    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: organizationId,
        legalName: organization.legalName,
        tradeName: organization.tradeName,
        email: organization.email,
        cnpj: organization.cnpj,
        city: organization.city,
        state: organization.state,
      }),
    );
  });

  afterAll(async () => {
    if (organizationId) {
      await prisma.organization
        .delete({
          where: { id: organizationId },
        })
        .catch(() => undefined);
    }

    await app.close();
  });
});
