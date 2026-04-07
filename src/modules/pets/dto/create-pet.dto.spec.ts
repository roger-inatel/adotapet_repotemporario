import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePetDto } from './create-pet.dto';

describe('CreatePetDto', () => {
  it('rejeita enums invalidos na criacao de pet', async () => {
    const dto = plainToInstance(CreatePetDto, {
      name: 'Thor',
      species: 'hamster',
      sex: 'unknown',
      size: 'gigante',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'species')).toBe(true);
    expect(errors.some((error) => error.property === 'sex')).toBe(true);
    expect(errors.some((error) => error.property === 'size')).toBe(true);
  });
});
