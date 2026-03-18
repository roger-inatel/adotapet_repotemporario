import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateAdoptionDto {
  @ApiProperty({ example: 'cm8pet1230000abcd1234efgh' })
  @Transform(trimString)
  @IsString()
  petId: string;

  @ApiPropertyOptional({
    example: 'Tenho quintal grande e experiência com cães idosos.',
  })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(500)
  message?: string;
}
