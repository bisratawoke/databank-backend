import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, SortOrder, Types, SortValues } from 'mongoose';
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
import { PaginationQueryDto } from 'src/common/dto/paginated-query.dto';
import { Field } from '../field/schemas/field.schema';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<Report>,
    @InjectModel(Data.name) private readonly dataModel: Model<Data>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
    @InjectModel(Field.name) private readonly fieldModel: Model<Field>,

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
      const departmentHead = await this.getDepartmentHead({ reportId });
      await this.publishToInappQueue({
        body: `report ${reportId} has been updated to ${status}`,
        to: departmentHead._id.toString(),
      });
      return {};
    } catch (err) {
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
      const heads = await this.userService.findDeputyHead();

      heads.forEach(async (head) => {
        await this.publishToInappQueue({
          body: `reports ${reportId} has been updated to approved by department head and requires approval!`,
          to: head._id.toString(),
        });
      });
      return {};
    } catch (error) {}
  }
  public async requestDissiminationApproval({
    reportId,
    from,
  }: {
    reportId: string;
    from: string;
  }) {
    try {
      const heads = await this.getDissimenationHead();

      heads.forEach(async (head) => {
        await this.publishToInappQueue({
          body: `reports ${reportId} has been updated to approved by department head and requires approval!`,
          to: head._id.toString(),
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
      console.log('============== is report department head ============');
      console.log(departmentHead);

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
      if (!(await this.isReportDepartmentHead({ reportId, from })))
        throw new UnauthorizedException('Not Authorized');

      const author = await this.getReportAuthor(reportId);
      console.log(
        '=========== in inital request response service ================',
      );
      console.log(author);
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

      console.log('============ in request initial approval =============');
      console.log(departmentHead);
      const emailMessage = {
        body: `report created. please update the status!`,
        to: departmentHead.email,
        from: from,
      };

      const inAppMessage = {
        body: `Report Created. Please Approve or reject it!`,
        to: departmentHead._id,
      };

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
  async deputyApproval(reportId: string) {
    try {
      const updatedReport = await this.reportModel.findByIdAndUpdate(
        new Types.ObjectId(reportId),
        { status: Status['Deputy Approved'] },
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

  async findAll(): Promise<any[]> {
    // Fetch reports with existing populations
    const reports = await this.reportModel
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

    // Fetch all departments with their categories, subcategories, and reports
    const departments = await this.departmentModel
      .find()
      .populate({
        path: 'category',
        populate: {
          path: 'subcategory',
          populate: {
            path: 'report',
            model: 'Report',
          },
        },
      })
      .exec();

    // Map reports to their departments
    const reportWithDepartment = reports.map((report) => {
      // Find the department that contains this report
      const department = departments.find((dept) =>
        dept.category.some((category: any) =>
          category.subcategory.some((subcategory) =>
            subcategory.report.some((r) => r._id.equals(report._id)),
          ),
        ),
      );

      // Return report with department added dynamically
      return {
        ...report.toObject(),
        department: department ? department.toObject() : null,
      };
    });

    return reportWithDepartment;
  }

  async findAllUnAuth(): Promise<Report[]> {
    return (
      this.reportModel
        .find()
        // .populate({
        //   path: 'fields',

        //   populate: {
        //     path: 'type',
        //     model: 'FieldType',
        //   },
        // })
        // .populate({
        //   path: 'data',
        //   populate: {
        //     path: 'field',
        //     model: 'Field',
        //     populate: {
        //       path: 'type',
        //       model: 'FieldType',
        //     },
        //   },
        // })
        .populate('author')
        .exec()
    );
  }

  async findAllPaginated(query: ReportQueryDto) {
    const { page = 1, limit = 10, status } = query;

    const reports = await this.reportModel
      .find()
      .where('status')
      .equals(status)
      .select('-fields -data') // Exclude fields and data initially
      .populate('author', 'name email') // Only select necessary author fields
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Use lean for better performance

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total: await this.reportModel.countDocuments(),
      },
    };
  }

  async findReportFields(reportId: string, query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;

    const reportWithFields = await this.reportModel
      .findById(reportId)
      .select('fields')
      .populate({
        path: 'fields',
        options: {
          skip: (page - 1) * limit,
          limit: limit,
        },
        populate: {
          path: 'type',
          model: 'FieldType',
        },
      })
      .exec();

    if (!reportWithFields) {
      throw new NotFoundException('Report not found');
    }

    const totalItems = await this.reportModel
      .aggregate([
        {
          $project: {
            fieldsCount: { $size: '$fields' },
          },
        },
        {
          $group: {
            _id: null,
            totalDataItems: { $sum: '$fieldsCount' },
          },
        },
      ])
      .exec();

    const totalDataItems = totalItems[0]?.totalDataItems || 0;
    const fields = reportWithFields ? reportWithFields.fields : [];

    return {
      data: fields,
      pagination: {
        page,
        limit,
        totalItems: totalDataItems,
      },
    };
  }

  async findReportData(reportId: string, query: PaginationQueryDto) {
    const { page = 1, limit = 10 } = query;

    const reportWithData = await this.reportModel
      .findById(reportId)
      .select('data')
      .populate({
        path: 'data',
        options: {
          skip: (page - 1) * limit,
          limit: limit,
        },
      })
      .exec();

    if (!reportWithData) {
      throw new NotFoundException('Report not found');
    }
    const totalItems = await this.reportModel
      .aggregate([
        {
          $project: {
            dataCount: { $size: '$data' },
          },
        },
        {
          $group: {
            _id: null,
            totalDataItems: { $sum: '$dataCount' },
          },
        },
      ])
      .exec();

    const totalDataItems = totalItems[0]?.totalDataItems || 0;
    const data = reportWithData ? reportWithData.data : [];
    return {
      data: data,
      pagination: {
        page,
        limit,
        totalItems: totalDataItems,
      },
    };
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
  async findOneNotPopulated(id: string): Promise<Report> {
    const report = await this.reportModel
      .findById(id)
      .select('-fields -data') // Exclude fields and data initially
      .populate('author', 'name email') // Only select necessary author fields
      .exec();
    // .populate({
    //   path: 'fields',
    //   populate: {
    //     path: 'type',
    //     model: 'FieldType',
    //   },
    // })
    // .populate({
    //   path: 'data',
    //   populate: {
    //     path: 'field',
    //     model: 'Field',
    //     populate: {
    //       path: 'type',
    //       model: 'FieldType',
    //     },
    //   },
    // })
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    try {
      const { fields, data } = updateReportDto;
      console.log('======== in here ==============');
      console.log(data);
      console.log(id);
      const existingReport = await this.reportModel.findById(id).exec();
      if (!existingReport) {
        console.log('========== in error ==========');
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

      console.log('======== in service ========');
      console.log(updatedData);
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
