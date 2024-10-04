import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './schemas/report.schema';
import { DataService } from '../data/data.service';
import { Data } from '../data/schemas/data.schema';
import { CreateDataDto } from '../data/dto/create-data.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<Report>,
    @InjectModel(Data.name) private readonly dataModel: Model<Data>,
    private readonly dataService: DataService,
  ) { }

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const createdReport = new this.reportModel(createReportDto);
    return createdReport.save();
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

  // Update report with new and existing data
  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    console.log("arguments recieved: ", { id, updateReportDto })
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
  }

  async remove(id: string): Promise<void> {
    const result = await this.reportModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }
}
