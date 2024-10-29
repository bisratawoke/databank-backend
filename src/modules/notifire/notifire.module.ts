import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMqService } from './rabbitmq.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from './EmailService';
import { NotifireController } from './notifire.controller';
import { NotifireService } from './notifire.service';
import { Notifire, NotifireSchema } from './schemas/notifire.schema';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Notifire.name, schema: NotifireSchema },
    ]),
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
  ],
  controllers: [NotifireController],
  providers: [RabbitMqService, EmailService, NotifireService],
})
export class NotifireModule {}
