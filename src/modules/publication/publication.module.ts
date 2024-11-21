import { Module } from '@nestjs/common';
import { PublicationController } from './publication.controller';
import { PublicationService } from './publication.service';
import { MinioService } from 'src/minio/minio.service';
import {
  Metastore,
  MetastoreSchema,
} from '../metastore/schemas/metastore.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MetastoreService } from '../metastore/metastore.service';
import { Publication, PublicationSchema } from './schemas/publication.schema';
import { AuthModule } from '../auth/auth.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
@Module({
  imports: [
    AuthModule,
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
      { name: Publication.name, schema: PublicationSchema },
      { name: Metastore.name, schema: MetastoreSchema },
    ]),
  ],
  controllers: [PublicationController],
  providers: [PublicationService, MinioService, MetastoreService],
})
export class PublicationModule {}
