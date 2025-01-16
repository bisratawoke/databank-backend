import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatterController } from './chatter.controller';
import { ChatterService } from './chatter.service';
import Chatter, { ChatterSchema } from './schemas/chatter.schema';
import Message, { MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chatter.name, schema: ChatterSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ChatterController],
  providers: [ChatterService],
})
export class ChatterModule {}

