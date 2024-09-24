import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Field } from './field.schema';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

@Injectable()
export class FieldService {
  constructor(@InjectModel(Field.name) private fieldModel: Model<Field>) {}

  // Create a new Field
  async create(createFieldDto: CreateFieldDto): Promise<Field> {
    const createdField = new this.fieldModel(createFieldDto);
    return createdField.save();
  }

  // Retrieve all Fields
  async findAll(): Promise<Field[]> {
    return this.fieldModel.find().populate('type').exec();
  }

  // Retrieve a Field by ID
  async findById(id: string): Promise<Field> {
    const field = await this.fieldModel.findById(id).populate('type').exec();
    if (!field) {
      throw new NotFoundException(`Field with ID ${id} not found`);
    }
    return field;
  }

  // Update a Field by ID
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

  // Delete a Field by ID
  async delete(id: string): Promise<Field> {
    const deletedField = await this.fieldModel.findByIdAndDelete(id).exec();
    if (!deletedField) {
      throw new NotFoundException(`Field with ID ${id} not found`);
    }
    return deletedField;
  }
}
