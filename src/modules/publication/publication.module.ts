import { Module } from '@nestjs/common';
import { PublicationController } from './publication.controller';
import { PublicationService } from './publication.service';
import { MinioService } from 'src/minio/minio.service';

@Module({
  controllers: [PublicationController],
  providers: [PublicationService, MinioService],
})
export class PublicationModule {}
