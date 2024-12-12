import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, Status } from './schemas/report.schema';
import { DataService } from '../data/data.service';
import { Data } from '../data/schemas/data.schema';
import { CreateDataDto } from '../data/dto/create-data.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DepartmentService } from '../department/department.service';
import { UpdateStatusDto } from './dto/UpdateStatus.dto';
import { Department } from '../department/schemas/department.schema';
import { SubCategory } from '../sub-category/schemas/sub-category.schema';
import { Category } from '../category/schemas/category.schema';
import { UserService } from '../auth/services/user.service';
@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<Report>,
    @InjectModel(Data.name) private readonly dataModel: Model<Data>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,

    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategory>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly dataService: DataService,
    private readonly amqpConnection: AmqpConnection,
    private readonly departmentService: DepartmentService,
    private readonly userService: UserService,
  ) {}

  public async dissmenationDeptResponse(reportId, status, from) {
    try {
      console.log('========== in dissmenationDeptResponse =================');
      const departmentHead = await this.getDepartmentHead({ reportId });
      console.log(departmentHead);
      await this.publishToInappQueue({
        body: `report ${reportId} has been updated to ${status}`,
        to: departmentHead._id.toString(),
      });
      return {};
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
    }
  }

  public async getDissimenationHead() {
    const user = await this.userService.findDissimenationHead();
    return user;
  }
  public async requestSecondApproval({
    reportId,
    from,
  }: {
    reportId: string;
    from: string;
  }) {
    try {
      const dissmenationHeads = await this.getDissimenationHead();
      console.log('========== in dis head =================');
      console.log(dissmenationHeads);
      dissmenationHeads.forEach(async (dissmenationHead) => {
        await this.publishToInappQueue({
          body: `reports ${reportId} has been updated to approved by dpertment head and requires your final say!`,
          to: dissmenationHead._id.toString(),
        });
      });
      return {};
    } catch (error) {}
  }

  async getDepartmentHead({ reportId }: { reportId: string }) {
    try {
      const department = await this.getReportParentDepartment(reportId);
      const departmentHead: any =
        await this.departmentService.getDepartmentHeadByDepartmentId(
          String(department._id.toString()),
        );

      return departmentHead;
    } catch (err) {
      throw err;
    } finally {
    }
  }

  async isReportDepartmentHead({ reportId, from }) {
    try {
      const department = await this.getReportParentDepartment(reportId);
      const departmentHead: any =
        await this.departmentService.getDepartmentHeadByDepartmentId(
          String(department._id.toString()),
        );

      console.log('======= is report department head ============');
      console.log(from);
      console.log(departmentHead._id);
      return from.toString() == departmentHead._id.toString();
    } catch (err) {
    } finally {
    }
  }

  public async initialRequestResponse(
    status: string,
    reportId: string,
    from: string,
  ) {
    try {
      console.log(
        '================== in initial request response =====================',
      );
      console.log(status);
      if (!(await this.isReportDepartmentHead({ reportId, from })))
        throw new UnauthorizedException('Not Authorized');

      const author = await this.getReportAuthor(reportId);
      await this.publishToInappQueue({
        to: author._id.toString(),
        body: `report ${reportId} status has been updated to ${status}`,
      });
      return author;
    } catch (err) {
      throw err;
    } finally {
    }
  }

  async getReportAuthor(reportId: string): Promise<Types.ObjectId | null> {
    const report = await this.reportModel
      .findById(reportId)
      .select('author')
      .populate('author')
      .exec();

    return report ? report.author : null;
  }

  private async publishToInappQueue(message: { body: string; to: string }) {
    await this.amqpConnection.publish(
      'logs_exchange',
      'inapp_notification_queue',
      message,
    );
  }
  async requestInitialApproval({ reportId, from }) {
    try {
      const department = await this.getReportParentDepartment(reportId);

      const departmentHead: any =
        await this.departmentService.getDepartmentHeadByDepartmentId(
          String(department._id.toString()),
        );

      const emailMessage = {
        body: `report created. please update the status!`,
        to: departmentHead.email,
        from: from,
      };

      const inAppMessage = {
        body: `Report Created. Please Approve or reject it!`,
        to: departmentHead._id,
      };

      console.log('======= in request initial approval method ======');
      console.log(departmentHead);
      // await this.amqpConnection.publish('logs_exchange', 'email', message);
      await this.amqpConnection.publish(
        'logs_exchange',
        'inapp_notification_queue',
        inAppMessage,
      );

      return;
    } catch (err) {
      throw err;
    } finally {
    }
  }
  async getReportParentDepartment(
    reportId: string,
  ): Promise<Department | null> {
    try {
      // Validate reportId as a MongoDB ObjectId
      if (!Types.ObjectId.isValid(reportId)) {
        throw new Error('Invalid report ID');
      }

      // Step 1: Find the SubCategory containing the report
      const subCategory = await this.subCategoryModel.findOne({
        report: reportId,
      });

      console.log('============= in sub category ================');
      console.log(subCategory);
      if (!subCategory) {
        throw new Error('SubCategory containing the report not found');
      }

      // Step 2: Find the Category containing this SubCategory
      const category = await this.categoryModel.findOne({
        subcategory: subCategory._id.toString(),
      });
      if (!category) {
        throw new Error('Category containing the SubCategory not found');
      }

      // Step 3: Find the Department containing this Category
      const department = await this.departmentModel.findOne({
        category: category._id,
      });
      if (!department) {
        throw new Error('Department containing the Category not found');
      }

      return department;
    } catch (err) {
      throw err;
    }
  }
  async approve(reportId: string) {
    try {
      const updatedReport = await this.reportModel.findByIdAndUpdate(
        new Types.ObjectId(reportId),
        { status: Status.Approved },
        { new: true },
      );

      if (!updatedReport) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      return updatedReport;
    } catch (err) {
      throw err;
    } finally {
    }
  }
  async reject(reportId: string) {
    try {
      const updatedReport = await this.reportModel.findByIdAndUpdate(
        new Types.ObjectId(reportId),
        { status: Status.Rejected },
        { new: true },
      );

      if (!updatedReport) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      return updatedReport;
    } catch (err) {
      throw err;
    } finally {
    }
  }
  async publish(reportId: string) {
    try {
      const updatedReport = await this.reportModel.findByIdAndUpdate(
        new Types.ObjectId(reportId),
        { status: Status.Published },
        { new: true },
      );

      console.log('=========== in publish service =================');
      console.log(updatedReport);
      if (!updatedReport) {
        throw new NotFoundException(`Report with ID ${reportId} not found`);
      }

      return updatedReport;
    } catch (err) {
      throw err;
    } finally {
    }
  }
  async fetchDepartmentExperts(reportId: string) {
    return [{ email: 'awoke199@gmail.com' }, { email: 'robel@360ground.com' }];
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<Report> {
    try {
      const report = await this.reportModel.findById(id).exec();
      if (!report) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      report.status = updateStatusDto.status;
      report.data_status = updateStatusDto.data_status || report.data_status;

      return report.save();
    } catch (err) {
      throw err;
    } finally {
      const departmentExperts = await this.fetchDepartmentExperts(id);
      const message = {
        body: `report status updated to ${updateStatusDto.status}`,
      };
      departmentExperts.forEach(async (expert) => {
        await this.amqpConnection.publish('logs_exchange', 'email', {
          ...message,
          to: expert.email,
        });
      });
    }
  }

  async create({
    report: createReportDto,
  }: {
    report: CreateReportDto;
  }): Promise<Report> {
    try {
      const createdReport = new this.reportModel(createReportDto);
      return createdReport.save();
    } catch (err) {
      throw err;
    } finally {
      // const departmentHead = await this.departmentService.getDepartmentHead(
      //   createReportDto.author,
      // );
      // const message = {
      //   body: `report created. please update the status!`,
      //   to: departmentHead.email,
      //   _id: departmentHead._id,
      //   from: createReportDto.author,
      // };
      // await this.amqpConnection.publish('logs_exchange', 'email', message);
      // await this.amqpConnection.publish('logs_exchange', 'inapp', message);
    }
  }

  async findAll(): Promise<Report[]> {
    return this.reportModel
      .find()
      .populate({
        path: 'fields',

        populate: {
          path: 'type',
          model: 'FieldType',
        },
      })
      .populate({
        path: 'data',
        populate: {
          path: 'field',
          model: 'Field',
          populate: {
            path: 'type',
            model: 'FieldType',
          },
        },
      })
      .populate('author')
      .exec();
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportModel
      .findById(id)
      .populate({
        path: 'fields',
        populate: {
          path: 'type',
          model: 'FieldType',
        },
      })
      .populate({
        path: 'data',
        populate: {
          path: 'field',
          model: 'Field',
          populate: {
            path: 'type',
            model: 'FieldType',
          },
        },
      })
      .exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    try {
      console.log('arguments recieved: ', { id, updateReportDto });
      const { fields, data } = updateReportDto;

      const existingReport = await this.reportModel.findById(id).exec();
      if (!existingReport) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }

      const updatedFields = fields
        ? [
            ...new Set([
              ...existingReport.fields.map((field: Types.ObjectId) =>
                field.toString(),
              ),
              ...fields,
            ]),
          ].map((field) => new Types.ObjectId(field))
        : existingReport.fields;

      const updatedData = data
        ? [
            ...new Set([
              ...existingReport.data.map((d: Types.ObjectId) => d.toString()),
              ...data,
            ]),
          ].map((d) => new Types.ObjectId(d))
        : existingReport.data;

      const updatedReport = await this.reportModel
        .findByIdAndUpdate(
          id,
          { ...updateReportDto, fields: updatedFields, data: updatedData },
          { new: true },
        )
        .populate({
          path: 'fields',
        })
        .populate({
          path: 'data',
        })
        .exec();

      return updatedReport;
    } catch (err) {
      throw err;
    } finally {
      if (updateReportDto.fields) return;
      const dessiminationHead = await this.fetchDessiminationHead();
      const message = {
        body: 'Data updated successfully. please update the status as you see fit',
        to: dessiminationHead.email,
      };
      await this.amqpConnection.publish('logs_exchange', 'email', message);
      return;
    }
  }

  async fetchDessiminationHead() {
    return { email: 'awoke199@gmail.com' };
  }
  async remove(id: string): Promise<void> {
    const result = await this.reportModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }
}
