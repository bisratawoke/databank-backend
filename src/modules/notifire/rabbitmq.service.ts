import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { EmailService } from './EmailService';
import { NotifireService } from './notifire.service';

@Injectable()
export class RabbitMqService {
  private readonly logger = new Logger(RabbitMqService.name);
  constructor(
    private readonly emailService: EmailService,
    private readonly notifireService: NotifireService,
  ) {}
  @RabbitSubscribe({
    exchange: 'logs_exchange',
    routingKey: 'email',
    queue: 'logs_queue',
  })
  public async handleMessage(message: any) {
    // await this.emailService.sendEmail('testing', message.body, message.to);
    await this.notifireService.create({
      message: message.body,
      seen: false,
      user: message.to,
    });
    this.logger.log(`Received message: ${JSON.stringify(message)}`);
  }
}
