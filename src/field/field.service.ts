import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Field } from './field.schema'; // Adjust the import path as necessary

@Injectable()
export class FieldService {
  constructor(@InjectModel(Field.name) private fieldModel: Model<Field>) {}

  // Create a new Field
  async create(fieldData: Partial<Field>): Promise<Field> {
    const createdField = new this.fieldModel(fieldData);
    return createdField.save();
  }

  // Retrieve all Fields
  async findAll(): Promise<Field[]> {
    return this.fieldModel.find().populate('type').exec(); // Populate the 'type' reference
  }

  // Retrieve a Field by ID
  async findById(id: string): Promise<Field> {
    return this.fieldModel.findById(id).populate('type').exec();
  }
}
