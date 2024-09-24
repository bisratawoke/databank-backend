import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { Data, DataSchema } from './schemas/data.schema';
import { FieldType, FieldTypeSchema } from '../field-type/schemas/field-type.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Data', schema: DataSchema },
      { name: FieldType.name, schema: FieldTypeSchema },
    ]),
  ],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule { }
