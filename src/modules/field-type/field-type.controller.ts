import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FieldTypeService } from './field-type.service'; // Adjust the import path as necessary
import { FieldType } from './field-type.schema';

@Controller('field-types') // Define the base route for the controller
export class FieldTypeController {
  constructor(private readonly fieldTypeService: FieldTypeService) {}

  // Create a new FieldType
  @Post()
  async create(@Body() fieldTypeData: Partial<FieldType>): Promise<FieldType> {
    return this.fieldTypeService.create(fieldTypeData);
  }

  // Get all FieldTypes
  @Get()
  async findAll(): Promise<FieldType[]> {
    return this.fieldTypeService.findAll();
  }

  // Get a FieldType by ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<FieldType> {
    return this.fieldTypeService.findById(id);
  }
}
