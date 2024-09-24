import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FieldService } from './field.service'; // Adjust the import path as necessary
import { Field } from './field.schema';

@Controller('fields') // Define the base route for the controller
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  // Create a new Field
  @Post()
  async create(@Body() fieldData: Partial<Field>): Promise<Field> {
    return this.fieldService.create(fieldData);
  }

  // Get all Fields
  @Get()
  async findAll(): Promise<Field[]> {
    return this.fieldService.findAll();
  }

  // Get a Field by ID
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Field> {
    return this.fieldService.findById(id);
  }
}
