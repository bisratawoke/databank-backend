import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportService } from './report.service';
import { ReportController } from './controllers/report.controller';
import { Report, ReportSchema } from './schemas/report.schema';
import { Data, DataSchema } from '../data/schemas/data.schema';
import {
  FieldType,
  FieldTypeSchema,
} from '../field-type/schemas/field-type.schema';
import { Field, FieldSchema } from '../field/schemas/field.schema';
import { DataService } from '../data/data.service';
import { AuthModule } from '../auth/auth.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DepartmentModule } from '../department/department.module';
import {
  Department,
  DepartmentSchema,
} from '../department/schemas/department.schema';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import {
  SubCategory,
  SubCategorySchema,
} from '../sub-category/schemas/sub-category.schema';
import { PortalReportController } from './controllers/portal-report.controller';

@Module({
  imports: [
    AuthModule,
    DepartmentModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'logs_exchange',
          type: 'topic',
        },
      ],
      uri: 'amqp://localhost:5672',
      connectionInitOptions: { wait: false },
    }),
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: Field.name, schema: FieldSchema },
      { name: Data.name, schema: DataSchema },
      { name: FieldType.name, schema: FieldTypeSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Category.name, schema: CategorySchema },
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
  ],
  controllers: [ReportController, PortalReportController],
  providers: [ReportService, DataService],
})
export class ReportModule { }
