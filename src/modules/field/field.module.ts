import { Module } from '@nestjs/common';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Field, FieldSchema } from './schemas/field.schema';
import { AuthModule } from '../auth/auth.module';
import { Data, DataSchema } from '../data/schemas/data.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Field.name, schema: FieldSchema },
      { name: Data.name, schema: DataSchema },
    ]),
  ],
  controllers: [FieldController],
  providers: [FieldService],
})
export class FieldModule {}
