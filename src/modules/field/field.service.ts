import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { Field } from './schemas/field.schema';
import { Data } from '../data/schemas/data.schema';

@Injectable()
export class FieldService {
  constructor(
    @InjectModel(Field.name) private fieldModel: Model<Field>,
    @InjectModel(Data.name) private DateModel: Model<Data>,
  ) {}

  async create(createFieldDto: CreateFieldDto): Promise<Field> {
    const createdField = new this.fieldModel(createFieldDto);
    return createdField.save();
  }

  async findAll(): Promise<Field[]> {
    return this.fieldModel.find().populate('type').exec();
  }

  async findRelatedData(id: string): Promise<Data[]> {
    const result = await this.DateModel.find({
      field: new mongoose.Types.ObjectId(id),
    });

    return result;
  }
  async findById(id: string): Promise<Field> {
    const field = await this.fieldModel.findById(id).populate('type').exec();
    if (!field) {
      throw new NotFoundException(`Field with ID ${id} not found`);
    }
    return field;
  }

  async update(id: string, updateFieldDto: UpdateFieldDto): Promise<Field> {
    const updatedField = await this.fieldModel
      .findByIdAndUpdate(id, updateFieldDto, {
        new: true,
        useFindAndModify: false,
      })
      .exec();
    if (!updatedField) {
      throw new NotFoundException(`Field with ID ${id} not found`);
    }
    return updatedField;
  }

  async delete(id: string): Promise<Field> {
    const deletedField = await this.fieldModel.findByIdAndDelete(id).exec();
    if (!deletedField) {
      throw new NotFoundException(`Field with ID ${id} not found`);
    }
    return deletedField;
  }
}
