import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDataDto, CreateMultipleDataDto } from './dto/create-data.dto';
import { UpdateDataDto, UpdateMultipleDataDto } from './dto/update-data.dto';
import { Data } from './schemas/data.schema';
import { Report } from '../report/schemas/report.schema';

@Injectable()
export class DataService {
    constructor(
        @InjectModel(Data.name) private readonly dataModel: Model<Data>,
        @InjectModel(Report.name) private readonly reportModel: Model<Report>
    ) { }

    async findAll(): Promise<Data[]> {
        return this.dataModel.find().populate({
            path: 'field',
            populate: {
                path: 'type',
                model: 'FieldType',
            }
        }).exec()
    }

    async findOne(id: string): Promise<Data> {
        const data = await this.dataModel.findById(id).populate({
            path: 'field',
            populate: {
                path: 'type',
                model: 'FieldType',
            }
        }).exec();
        if (!data) {
            throw new NotFoundException(`Data with ID ${id} not found`);
        }
        return data;
    }
    // Create multiple data entries
    async createMultiple(dataEntries: CreateMultipleDataDto): Promise<Data[]> {
        // Create data entries
        const createdData = await this.dataModel.create(
            dataEntries.dataEntries.map((dto) => ({
                ...dto,
                field: new Types.ObjectId(dto.field), // Convert field ID to ObjectId
            }))
        );

        // Update the report with the new data entries
        await this.reportModel.findByIdAndUpdate(
            dataEntries.reportId,
            { $push: { data: { $each: createdData.map(data => data._id) } } }, // Push all newly created data IDs to the report
            { new: true, runValidators: true }
        );

        return createdData; // Return the created data entries
    }



    // Update multiple data entries
    async updateMultiple(updateDataDtos: UpdateMultipleDataDto): Promise<Data[]> {
        const bulkOps = updateDataDtos.dataEntries.map((entry) => ({
            updateOne: {
                filter: {
                    _id: new Types.ObjectId(entry._id), // Match by data _id
                    field: new Types.ObjectId(entry.field), // Ensure the field matches
                },
                update: { $set: { value: entry.value } }, // Update the value
                upsert: true, // Insert if not found
            },
        }));

        await this.dataModel.bulkWrite(bulkOps);

        // Return the updated data
        const updatedData = await this.dataModel
            .find({ _id: { $in: updateDataDtos.dataEntries.map((e) => e._id) } })
            .populate({
                path: 'field',
                populate: { path: 'type', model: 'FieldType' },
            })
            .exec();

        return updatedData;
    }



    async remove(id: string): Promise<void> {
        const result = await this.dataModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Data with ID ${id} not found`);
        }
    }
}
