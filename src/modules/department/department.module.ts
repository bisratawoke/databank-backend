import { Module } from '@nestjs/common';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from './schemas/department.schema';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Report, ReportSchema } from '../report/schemas/report.schema';
import { SubCategory, SubCategorySchema } from '../sub-category/schemas/sub-category.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: User.name, schema: UserSchema },
      { name: Report.name, schema: ReportSchema },
      { name: SubCategory.name, schema: SubCategorySchema }
    ]),
  ],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule { }
