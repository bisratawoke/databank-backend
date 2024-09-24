import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FieldType } from './field-type.schema'; // Adjust the import path as necessary

@Injectable()
export class FieldTypeService {
  constructor(
    @InjectModel(FieldType.name) private fieldTypeModel: Model<FieldType>,
  ) {}

  // Create a new FieldType
  async create(fieldTypeData: Partial<FieldType>): Promise<FieldType> {
    const createdFieldType = new this.fieldTypeModel(fieldTypeData);
    return createdFieldType.save();
  }

  // Retrieve all FieldTypes
  async findAll(): Promise<FieldType[]> {
    return this.fieldTypeModel.find().exec();
  }

  // Retrieve a FieldType by ID
  async findById(id: string): Promise<FieldType> {
    return this.fieldTypeModel.findById(id).exec();
  }
}
