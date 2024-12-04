import { PartialType } from '@nestjs/swagger';
import { CreatePublicationRequestDto } from './create-publication-request.dto';

export class UpdatePublicationRequestDto extends PartialType(
  CreatePublicationRequestDto,
) {}
