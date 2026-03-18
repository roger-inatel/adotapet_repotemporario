import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class LoginDto {
  @ApiProperty({ example: 'usuario@adotapet.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ng@Pass123' })
  @Transform(trimString)
  @IsString()
  @MinLength(8)
  password: string;
}
