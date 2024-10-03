import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { Data, DataSchema } from './schemas/data.schema';
import { Field, FieldSchema } from '../field/schemas/field.schema';
import { Report, ReportSchema } from '../report/schemas/report.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Data.name, schema: DataSchema },
      { name: Field.name, schema: FieldSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
  ],
  controllers: [DataController],
  providers: [DataService],
})
export class DataModule { }
