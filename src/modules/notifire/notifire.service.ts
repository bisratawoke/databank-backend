import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { EmailService } from './EmailService';

@Injectable()
export class RabbitMqService {
  private readonly logger = new Logger(RabbitMqService.name);
  constructor(private readonly emailService: EmailService) {}
  @RabbitSubscribe({
    exchange: 'logs_exchange',
    routingKey: 'email',
    queue: 'logs_queue',
  })
  public async handleMessage(message: any) {
    await this.emailService.sendEmail('testing', message.body, message.to);
    this.logger.log(`Received message: ${JSON.stringify(message)}`);
  }
}
