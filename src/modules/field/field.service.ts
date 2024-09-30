import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { Field } from './schemas/field.schema';

@Injectable()
export class FieldService {
  constructor(@InjectModel(Field.name) private fieldModel: Model<Field>) { }

  async create(createFieldDto: CreateFieldDto): Promise<Field> {
    const createdField = new this.fieldModel(createFieldDto);
    return createdField.save();
  }

  async findAll(): Promise<Field[]> {
    return this.fieldModel.find().populate('type').exec();
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
