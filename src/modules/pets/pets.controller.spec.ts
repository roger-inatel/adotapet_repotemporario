import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

describe('PetsController', () => {
  let controller: PetsController;

  const petsServiceMock = {
    uploadPhoto: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [
        {
          provide: PetsService,
          useValue: petsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PetsController>(PetsController);
  });

  it('deve retornar 400 ao fazer upload de foto sem arquivo', () => {
    expect(() => controller.uploadPhoto('pet-1', { id: 'user-1' }, undefined as never)).toThrow(
      new BadRequestException('Arquivo de foto nao enviado.'),
    );

    expect(petsServiceMock.uploadPhoto).not.toHaveBeenCalled();
  });
});
