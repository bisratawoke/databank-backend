import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDataDto } from './dto/create-data.dto';
import { UpdateDataDto } from './dto/update-data.dto';
import { Data } from './schemas/data.schema';

@Injectable()
export class DataService {
    constructor(@InjectModel(Data.name) private readonly dataModel: Model<Data>) { }

    async create(createDataDto: CreateDataDto): Promise<Data> {
        const createdData = new this.dataModel(createDataDto);
        return createdData.save();
    }

    async findAll(): Promise<Data[]> {
        return this.dataModel.find().populate('type').exec();
    }

    async findOne(id: string): Promise<Data> {
        const data = await this.dataModel.findById(id).populate('type').exec();
        if (!data) {
            throw new NotFoundException(`Data with ID ${id} not found`);
        }
        return data;
    }

    async update(id: string, updateDataDto: UpdateDataDto): Promise<Data> {
        const updatedData = await this.dataModel
            .findByIdAndUpdate(id, updateDataDto, { new: true })
            .populate('type')
            .exec();
        if (!updatedData) {
            throw new NotFoundException(`Data with ID ${id} not found`);
        }
        return updatedData;
    }

    async remove(id: string): Promise<void> {
        const result = await this.dataModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Data with ID ${id} not found`);
        }
    }
}
