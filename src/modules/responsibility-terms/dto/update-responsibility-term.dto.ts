import { PartialType } from '@nestjs/swagger';
import { CreateResponsibilityTermDto } from './create-responsibility-term.dto';

export class UpdateResponsibilityTermDto extends PartialType(CreateResponsibilityTermDto) {}
