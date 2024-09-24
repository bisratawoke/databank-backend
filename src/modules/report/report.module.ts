import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Report, ReportSchema } from './schemas/report.schema';
import { FieldSchema } from '../fields/schemas/field.schema';
import { DataSchema } from '../data/schemas/data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Report', schema: ReportSchema },
      { name: 'Field', schema: FieldSchema },
      { name: 'Data', schema: DataSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule { }
