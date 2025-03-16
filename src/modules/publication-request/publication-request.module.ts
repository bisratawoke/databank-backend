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
import { MulterModule } from '@nestjs/platform-express';
import { MinioModule } from 'src/minio/minio.module';
import PublicationPayment, {
  PublicationPaymentSchema,
} from './schemas/publication-payment.schema';
import { DepartmentModule } from '../department/department.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  controllers: [PublicationRequestController],
  providers: [PublicationRequestService],
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'logs_exchange',
          type: 'topic',
        },
      ],
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: false },
    }),
    MongooseModule.forFeature([
      { name: PublicationRequest.name, schema: PublicationRequestSchema },
      { name: PublicationPayment.name, schema: PublicationPaymentSchema },
    ]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
    AuthModule,
    CategoryModule,
    MinioModule,
    DepartmentModule,
  ],
})
export class PublicationRequestModule {}
