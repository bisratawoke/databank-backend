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

  // async update(id: string, updateReportDto: UpdateReportDto): Promise<Report> {
  //   const { fields, data } = updateReportDto;

  //   const existingReport = await this.reportModel.findById(id).exec();
  //   if (!existingReport) {
  //     throw new NotFoundException(`Report with ID ${id} not found`);
  //   }

  //   const updatedFields = fields
  //     ? [
  //       ...new Set([
  //         ...existingReport.fields.map((field: Types.ObjectId) =>
  //           field.toString(),
  //         ),
  //         ...fields,
  //       ]),
  //     ].map((field) => new Types.ObjectId(field))
  //     : existingReport.fields;

  //   const updatedData = data
  //     ? [
  //       ...new Set([
  //         ...existingReport.data.map((d: Types.ObjectId) => d.toString()),
  //         ...data,
  //       ]),
  //     ].map((d) => new Types.ObjectId(d))
  //     : existingReport.data;

  //   const updatedReport = await this.reportModel
  //     .findByIdAndUpdate(
  //       id,
  //       { ...updateReportDto, fields: updatedFields, data: updatedData },
  //       { new: true },
  //     )
  //     .populate({
  //       path: 'fields',
  //     })
  //     .populate({
  //       path: 'data',
  //     })
  //     .exec();

  //   return updatedReport;
  // }

  // async update(id: string, dataIds: string[]) {
  //   try {
  //     console.log(`Updating report ${id} with data IDs:`, dataIds);

  //     // Validate report existence
  //     const existingReport = await this.reportModel.findById(id).exec();

  //     if (!existingReport) {
  //       throw new NotFoundException(`Report with ID ${id} not found`);
  //     }

  //     // Convert string IDs to ObjectIds
  //     const dataObjectIds = dataIds.map(id => new Types.ObjectId(id));

  //     // Validate all dataIds exist
  //     const dataExists = await this.dataModel.countDocuments({
  //       _id: { $in: dataObjectIds },
  //     });

  //     if (dataExists !== dataIds.length) {
  //       throw new BadRequestException('Some data IDs are invalid');
  //     }

  //     // Get current data entries
  //     const currentDataIds = existingReport.data.map(d => d.toString());

  //     // Separate data IDs into existing and new
  //     const existingDataIds = dataObjectIds.filter(id =>
  //       currentDataIds.includes(id.toString())
  //     );
  //     const newDataIds = dataObjectIds.filter(id =>
  //       !currentDataIds.includes(id.toString())
  //     );

  //     // First, update existing data entries (if any)
  //     if (existingDataIds.length > 0) {
  //       await this.reportModel.findByIdAndUpdate(
  //         id,
  //         {
  //           $set: {
  //             'data.$[elem]': existingDataIds
  //           }
  //         },
  //         {
  //           arrayFilters: [{ 'elem._id': { $in: existingDataIds } }],
  //           new: true
  //         }
  //       );
  //     }

  //     // Then, append new data entries (if any)
  //     const updatedReport = await this.reportModel
  //       .findByIdAndUpdate(
  //         id,
  //         {
  //           $push: newDataIds.length > 0 ? { data: { $each: newDataIds } } : {}
  //         },
  //         {
  //           new: true,
  //           runValidators: true,
  //         }
  //       )
  //       .populate({
  //         path: 'fields',
  //         populate: {
  //           path: 'type',
  //           model: 'FieldType',
  //         },
  //       })
  //       .populate({
  //         path: 'data',
  //         populate: {
  //           path: 'field',
  //           model: 'Field',
  //           populate: {
  //             path: 'type',
  //             model: 'FieldType',
  //           },
  //         },
  //       })
  //       .exec();

  //     console.log('Updated report:', updatedReport);
  //     return updatedReport;
  //   } catch (error) {
  //     console.error('Report update failed:', error);
  //     if (error instanceof NotFoundException || error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new Error(`Failed to update report: ${error.message}`);
  //   }
  // }

  // Update report with new and existing data
  async update(id: string, dataDtos: UpdateReportDto): Promise<Report> {
    const existingReport = await this.reportModel.findById(id).exec();
    if (!existingReport) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    const dataUpdates = dataDtos.data || [];

    // Create an array of promises to update each data entry
    const updatePromises = dataUpdates.map(async (dataUpdate) => {
      const { _id, field, value } = dataUpdate;

      // Find the existing data entry
      const existingData = await this.dataModel.findById(_id).exec();

      if (!existingData) {
        // Create new data entry if not found
        const newData = new this.dataModel({
          // If _id is intended to be set manually, ensure it's valid
          _id: new Types.ObjectId(_id), // or just omit this if you want MongoDB to generate it
          field, // Ensure this is valid and corresponds to an existing field ID
          value,
        });
        return newData.save(); // Save the new data entry
      }

      // Update the value of the existing data entry
      existingData.value = value; // Update value
      return existingData.save(); // Save the updated data entry
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Update report if necessary (e.g., update fields, etc.)
    const updatedReport = await this.reportModel
      .findByIdAndUpdate(
        id,
        { /* any updates to the report itself */ },
        { new: true, runValidators: true }
      )
      .populate({
        path: 'fields',
        populate: { path: 'type', model: 'FieldType' },
      })
      .populate({
        path: 'data',
        populate: {
          path: 'field',
          model: 'Field',
          populate: { path: 'type', model: 'FieldType' },
        },
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
