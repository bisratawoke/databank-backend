import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report, ReportSchema } from './schemas/report.schema';
import { Data, DataSchema } from '../data/schemas/data.schema';
import { Field, FieldSchema } from '../field/field.schema';
import { FieldType, FieldTypeSchema } from '../field-type/field-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: Field.name, schema: FieldSchema },
      { name: Data.name, schema: DataSchema },
      { name: FieldType.name, schema: FieldTypeSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}