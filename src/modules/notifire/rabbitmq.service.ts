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
    queue: 'logs_email_queue',
  })
  public async handleMessage(message: any) {
    this.logger.log('Received email message:', message);

    try {
      await this.emailService.sendEmail(
        'Notification',
        message.body,
        message.to,
      );
      this.logger.log(`Email sent to ${message.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${message.to}`, error.stack);
    }
  }

  @RabbitSubscribe({
    exchange: 'logs_exchange',
    routingKey: 'inapp_notification_queue',
    queue: 'logs_inapp_queue',
  })
  public async handleInappMessage(message: any) {
    this.logger.log('Received in-app message:', message);

    try {
      await this.notifireService.create({
        message: message.body,
        user: message.to,
        seen: false,
      });
      this.logger.log(`In-app notification created for user ${message.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to create in-app notification for user ${message.to}`,
        error.stack,
      );
    }
  }
}
