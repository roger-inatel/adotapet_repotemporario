import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const normalizeCnpj = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/\D/g, '') : value;

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return value;
};

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Instituto AdotaPet' })
  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  legalName: string;

  @ApiPropertyOptional({ example: 'AdotaPet ONG' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(150)
  tradeName?: string;

  @ApiProperty({ example: 'contato@adotapet.org.br' })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiPropertyOptional({ example: '+55 11 99999-8888' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @Matches(/^(\+?\d{1,3}\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/, {
    message: 'phone format is invalid',
  })
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  @IsOptional()
  @Transform(normalizeCnpj)
  @IsString()
  @Matches(/^\d{14}$/, { message: 'cnpj must contain 14 digits' })
  cnpj?: string;

  @ApiPropertyOptional({ example: 'ONG focada em adoção responsável.' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
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

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isVerified?: boolean;
}
