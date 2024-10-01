import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDataDto } from './dto/create-data.dto';
import { UpdateDataDto, UpdateMultipleDataDto } from './dto/update-data.dto';
import { Data } from './schemas/data.schema';

@Injectable()
export class DataService {
    constructor(@InjectModel(Data.name) private readonly dataModel: Model<Data>) { }

    async create(createDataDto: CreateDataDto): Promise<Data> {
        const createdData = new this.dataModel(createDataDto);
        return createdData.save();
    }

    async createMultiple(createDataDtos: CreateDataDto[]): Promise<Data[]> {
        try {
            const createdData = await this.dataModel.create(createDataDtos.map((dto) => ({ ...dto, field: new Types.ObjectId(dto.field) })));
            console.log("createdData", createdData)
            return createdData
        } catch (error) {
            console.error(error)
            throw new Error('Data entry failed');
        }
    }


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

    async update(id: string, updateDataDto: UpdateDataDto): Promise<Data> {
        const updatedData = await this.dataModel
            .findByIdAndUpdate(id, updateDataDto, { new: true })
            .populate({
                path: 'field',
                populate: {
                    path: 'type',
                    model: 'FieldType',
                }
            })
            .exec();
        if (!updatedData) {
            throw new NotFoundException(`Data with ID ${id} not found`);
        }
        return updatedData;
    }

    // async update(id: string, updateMultipleDataDto: UpdateMultipleDataDto): Promise<Data[]> {
    //     try {
    //         const updateOperations = updateMultipleDataDto.dataEntries.map(entry => ({
    //             updateOne: {
    //                 filter: {
    //                     field: new Types.ObjectId(entry.field),
    //                     _id: { $in: [new Types.ObjectId(id)] }
    //                 },
    //                 update: { $set: { value: entry.value } },
    //                 upsert: true
    //             }
    //         }));

    //         const result = await this.dataModel.bulkWrite(updateOperations);
    //         console.log("updateResult", result);

    //         const updatedData = await this.dataModel.find({ _id: new Types.ObjectId(id) })
    //             .populate({
    //                 path: 'field',
    //                 populate: {
    //                     path: 'type',
    //                     model: 'FieldType',
    //                 }
    //             })
    //             .exec();

    //         if (updatedData.length === 0) {
    //             throw new NotFoundException(`Data with ID ${id} not found`);
    //         }

    //         return updatedData;
    //     } catch (error) {
    //         console.error(error);
    //         throw new Error('Data update failed');
    //     }
    // }

    async remove(id: string): Promise<void> {
        const result = await this.dataModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Data with ID ${id} not found`);
        }
    }
}
