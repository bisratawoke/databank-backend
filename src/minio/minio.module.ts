import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService], // Export the service to make it available in other modules
})
export class MinioModule {}
