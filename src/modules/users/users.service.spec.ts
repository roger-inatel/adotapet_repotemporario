import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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

  it('deve retornar erro ao criar usuario com email ja existente', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('senha-hash');
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      }),
    );

    await expect(
      service.create({
        fullName: 'Usuario Teste',
        email: 'usuario@teste.com',
        password: 'Senha@123',
      }),
    ).rejects.toThrow(new BadRequestException('Email is already in use.'));
  });

  it('deve atualizar senha usando hash e nao salvar a senha pura', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });
    (bcrypt.hash as jest.Mock).mockResolvedValue('nova-senha-hash');
    prismaMock.user.update.mockResolvedValue({
      id: 'user-1',
      fullName: 'Usuario Teste',
      email: 'usuario@teste.com',
      role: 'ADOPTER',
      isActive: true,
    });

    await service.update('user-1', { password: 'Nova@Senha123' });

    expect(bcrypt.hash).toHaveBeenCalledWith('Nova@Senha123', 10);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          password: 'nova-senha-hash',
        }),
      }),
    );
    expect(prismaMock.user.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          password: 'Nova@Senha123',
        }),
      }),
    );
  });

  it('deve listar usuarios sem selecionar password', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);

    await service.findAll();

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({
          password: true,
        }),
      }),
    );
  });

  it('deve buscar usuario por id sem selecionar password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      fullName: 'Usuario Teste',
      email: 'usuario@teste.com',
      role: 'ADOPTER',
      isActive: true,
    });

    await service.findOne('user-1');

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        select: expect.not.objectContaining({
          password: true,
        }),
      }),
    );
  });
});
