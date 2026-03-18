import { ApiProperty } from '@nestjs/swagger';
import { AdoptionRequestStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';

const toUpper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class UpdateAdoptionStatusDto {
  @ApiProperty({
    enum: [
      AdoptionRequestStatus.APPROVED,
      AdoptionRequestStatus.REJECTED,
      AdoptionRequestStatus.CANCELED,
    ],
    example: AdoptionRequestStatus.APPROVED,
  })
  @Transform(toUpper)
  @IsEnum(AdoptionRequestStatus)
  status: AdoptionRequestStatus;
}
