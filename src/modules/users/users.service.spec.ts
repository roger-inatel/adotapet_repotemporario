import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('deve retornar 404 ao buscar um usuario inexistente', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('usuario-inexistente')).rejects.toThrow(
      new NotFoundException('User with id "usuario-inexistente" was not found.'),
    );
  });

  it('deve retornar 404 ao remover um usuario inexistente', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.remove('usuario-inexistente')).rejects.toThrow(
      new NotFoundException('User with id "usuario-inexistente" was not found.'),
    );
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it('deve salvar a senha com hash ao criar um usuario', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('senha-hash');
    prismaMock.user.create.mockResolvedValue({
      id: 'user-1',
      fullName: 'Usuario Teste',
      email: 'usuario@teste.com',
      role: 'ADOPTER',
      isActive: true,
    });

    await service.create({
      fullName: 'Usuario Teste',
      email: 'usuario@teste.com',
      password: 'Senha@123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('Senha@123', 10);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          password: 'senha-hash',
        }),
      }),
    );
    expect(prismaMock.user.create).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          password: 'Senha@123',
        }),
      }),
    );
  });
});
