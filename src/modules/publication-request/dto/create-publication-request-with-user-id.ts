import { IsString } from 'class-validator';
import { CreatePublicationRequestDto } from './create-publication-request.dto';

export default class CreatePublicationRequestWithAuthorId extends CreatePublicationRequestDto {
  @IsString()
  author: string;
}
