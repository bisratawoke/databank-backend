import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './schemas/report.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private readonly reportModel: Model<Report>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const createdReport = new this.reportModel(createReportDto);
    return createdReport.save();
  }

  async findAll(): Promise<Report[]> {
    return this.reportModel
      .find()
      .populate({
        path: 'fields', // Assuming 'fields' is an array of ObjectIds
        // Remove populate 'type' if it's not valid in 'Field'
      })
      .populate({
        path: 'data', // Assuming 'data' is an array of ObjectIds
        // Remove populate 'type' if it's not valid in 'Data'
      })
      .exec();
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportModel
      .findById(id)
      .populate({
        path: 'fields',
        // Ensure that 'type' exists in 'fields', if not remove this
      })
      .populate({
        path: 'data',
        // Ensure that 'type' exists in 'data', if not remove this
      })
      .exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
    const updatedReport = await this.reportModel
      .findByIdAndUpdate(id, updateReportDto, { new: true })
      .populate({
        path: 'fields',
        // Apply consistent population logic
      })
      .populate({
        path: 'data',
        // Apply consistent population logic
      })
      .exec();
    if (!updatedReport) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return updatedReport;
  }

  async remove(id: string): Promise<void> {
    const result = await this.reportModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }
}
