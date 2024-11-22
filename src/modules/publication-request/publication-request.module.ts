import { Module } from '@nestjs/common';
import { PublicationRequestController } from './publication-request.controller';
import { PublicationRequestService } from './publication-request.service';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PublicationRequest,
  PublicationRequestSchema,
} from './schemas/publication-request.schema';

@Module({
  controllers: [PublicationRequestController],
  providers: [PublicationRequestService],
  imports: [
    MongooseModule.forFeature([
      { name: PublicationRequest.name, schema: PublicationRequestSchema },
    ]),
    AuthModule,
    CategoryModule,
  ],
})
export class PublicationRequestModule {}

