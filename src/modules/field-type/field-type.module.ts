import { Module } from '@nestjs/common';
import { FieldTypeController } from './field-type.controller';
import { FieldTypeService } from './field-type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FieldType, FieldTypeSchema } from './schemas/field-type.schema';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: FieldType.name, schema: FieldTypeSchema },
    ]),
  ],
  controllers: [FieldTypeController],
  providers: [FieldTypeService],
})
export class FieldTypeModule { }
