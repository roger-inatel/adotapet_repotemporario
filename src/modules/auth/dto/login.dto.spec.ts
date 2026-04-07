import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('rejeitar email invalido no login', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'email-invalido',
      password: 'Str0ng@Pass123',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('rejeitar senha curta no login', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'usuario@adotapet.com',
      password: '1234567',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });

  it('normalizar espacos e maiusculas no login', async () => {
    const dto = plainToInstance(LoginDto, {
      email: '  USUARIO@ADOTAPET.COM  ',
      password: '  Str0ng@Pass123  ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('usuario@adotapet.com');
    expect(dto.password).toBe('Str0ng@Pass123');
  });
});
