import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { FieldService } from './field.service';
import { Field } from './field.schema';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

@Controller('fields')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Post()
  async create(@Body() createFieldDto: CreateFieldDto): Promise<Field> {
    return this.fieldService.create(createFieldDto);
  }

  @Get()
  async findAll(): Promise<Field[]> {
    return this.fieldService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Field> {
    return this.fieldService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFieldDto: UpdateFieldDto,
  ): Promise<Field> {
    return this.fieldService.update(id, updateFieldDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Field> {
    return this.fieldService.delete(id);
  }
}
