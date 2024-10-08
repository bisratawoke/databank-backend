import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from 'src/minio/minio.service';
import { PublicationService } from './publication.service';

@Controller('publications')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @Get('vs/:bucketName')
  async getAll(@Param('bucketName') bucketName: string) {
    const list = await this.publicationService.listFiles(bucketName);
    return list;
  }
}
