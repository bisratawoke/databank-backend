import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { Data, DataSchema } from './schemas/data.schema';
import { FieldType, FieldTypeSchema } from '../field-type/field-type.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Data.name, schema: DataSchema },
      { name: FieldType.name, schema: FieldTypeSchema },
    ]),
  ],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule { }
