import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { FieldTypeService } from './field-type.service';
import { FieldType } from './field-type.schema';
import { CreateFieldTypeDto } from './dto/create-field-type.dto';
import { UpdateFieldTypeDto } from './dto/update-field-type.dto';

@Controller('field-types')
export class FieldTypeController {
  constructor(private readonly fieldTypeService: FieldTypeService) {}

  @Post()
  async create(
    @Body() createFieldTypeDto: CreateFieldTypeDto,
  ): Promise<FieldType> {
    return this.fieldTypeService.create(createFieldTypeDto);
  }

  @Get()
  async findAll(): Promise<FieldType[]> {
    return this.fieldTypeService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<FieldType> {
    return this.fieldTypeService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFieldTypeDto: UpdateFieldTypeDto,
  ): Promise<FieldType> {
    return this.fieldTypeService.update(id, updateFieldTypeDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<FieldType> {
    return this.fieldTypeService.delete(id);
  }
}
