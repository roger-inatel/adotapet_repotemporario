import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PetSize, PetStatus, Sex, Species } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const toUpper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return value;
};

export class CreatePetDto {
  @ApiProperty({ example: 'Thor' })
  @Transform(trimString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: Species, example: Species.DOG })
  @Transform(toUpper)
  @IsEnum(Species)
  species: Species;

  @ApiPropertyOptional({ example: 'Mixed-breed' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  breed?: string;

  @ApiProperty({ enum: Sex, example: Sex.MALE })
  @Transform(toUpper)
  @IsEnum(Sex)
  sex: Sex;

  @ApiPropertyOptional({ example: 24, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ageInMonths?: number;

  @ApiPropertyOptional({ enum: PetSize, example: PetSize.SMALL })
  @IsOptional()
  @Transform(toUpper)
  @IsEnum(PetSize)
  size?: PetSize;

  @ApiPropertyOptional({ example: 'Caramel' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(60)
  color?: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  vaccinated?: boolean;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  neutered?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  specialNeeds?: boolean;

  @ApiPropertyOptional({ example: 'Needs daily medication' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(500)
  specialNeedsDetails?: string;

  @ApiPropertyOptional({ example: 'Friendly and social pet' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: PetStatus, example: PetStatus.AVAILABLE })
  @IsOptional()
  @Transform(toUpper)
  @IsEnum(PetStatus)
  status?: PetStatus;

  @ApiPropertyOptional({ example: 'Sao Paulo' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(2)
  state?: string;

  @ApiProperty({ example: 'cm8xyz1230000abcd1234efgh' })
  @Transform(trimString)
  @IsString()
  registeredById: string;

  @ApiPropertyOptional({ example: 'cm8org1230000abcd1234ijkl' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  organizationId?: string;
}
