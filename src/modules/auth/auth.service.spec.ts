import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('Servico de autenticacao', () => {
  let service: AuthService;
  const usersServiceMock = {
    findByEmailForAuth: jest.fn(),
  };
  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar Unauthorized quando o email nao existir', async () => {
    usersServiceMock.findByEmailForAuth.mockResolvedValue(null);

    await expect(
      service.login({ email: 'usuario@teste.com', password: 'Senha@123' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password.'));

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });

  it('deve retornar Unauthorized quando a senha estiver incorreta', async () => {
    usersServiceMock.findByEmailForAuth.mockResolvedValue({
      id: 'user-1',
      email: 'usuario@teste.com',
      password: 'senha-hash',
      role: 'ADOPTER',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'usuario@teste.com', password: 'Senha@123' }),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password.'));

    expect(bcrypt.compare).toHaveBeenCalledWith('Senha@123', 'senha-hash');
    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });

  it('deve gerar token com sub e role quando o login for valido', async () => {
    usersServiceMock.findByEmailForAuth.mockResolvedValue({
      id: 'user-1',
      email: 'usuario@teste.com',
      password: 'senha-hash',
      role: 'ADOPTER',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

    const result = await service.login({
      email: 'usuario@teste.com',
      password: 'Senha@123',
    });

    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      role: 'ADOPTER',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });
});
