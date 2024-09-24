import { Module } from '@nestjs/common';
import { FieldTypeController } from './field-type.controller';
import { FieldTypeService } from './field-type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FieldType, FieldTypeSchema } from './field-type.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FieldType.name, schema: FieldTypeSchema },
    ]),
  ],
  controllers: [FieldTypeController],
  providers: [FieldTypeService],
})
export class FieldTypeModule { }
