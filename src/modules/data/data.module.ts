import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { Data, DataSchema } from './schemas/data.schema';
import { Field, FieldSchema } from '../field/field.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Data.name, schema: DataSchema },
      { name: Field.name, schema: FieldSchema },
    ]),
  ],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule { }
