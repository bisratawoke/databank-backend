import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatterController } from './chatter.controller';
import { ChatterService } from './chatter.service';
import Chatter, { ChatterSchema } from './schemas/chatter.schema';
import Message, { MessageSchema } from './schemas/message.schema';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Chatter.name, schema: ChatterSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ChatterController],
  providers: [ChatterService],
})
export class ChatterModule {}

