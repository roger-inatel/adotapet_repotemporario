import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UsersService } from '../../src/modules/users/users.service';

describe('UsersService (integration)', () => {
  let module: TestingModule;
  let service: UsersService;
  let prisma: PrismaService;

  const email = `users-service-integration-${Date.now()}@adotapet.test`;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get(UsersService);
    prisma = module.get(PrismaService);
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await module.close();
  });

  it('deve criar usuario no banco com senha hasheada e sem retornar password', async () => {
    const result = await service.create({
      fullName: 'Usuario Integracao',
      email,
      password: 'Senha@123',
      role: 'ADOPTER',
    });

    const persistedUser = await prisma.user.findUniqueOrThrow({
      where: { email },
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: persistedUser.id,
        fullName: 'Usuario Integracao',
        email,
        role: 'ADOPTER',
        isActive: true,
      }),
    );
    expect(result).not.toHaveProperty('password');
    expect(persistedUser.password).not.toBe('Senha@123');
    await expect(bcrypt.compare('Senha@123', persistedUser.password)).resolves.toBe(true);
  });
});
