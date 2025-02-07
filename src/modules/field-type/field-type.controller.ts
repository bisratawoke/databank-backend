import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FieldTypeService } from './field-type.service';
import { FieldType } from './schemas/field-type.schema';
import { CreateFieldTypeDto } from './dto/create-field-type.dto';
import { UpdateFieldTypeDto } from './dto/update-field-type.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FieldTypeDto } from './dto/field-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FieldDto } from '../field/dto/field.dto';
import { Field } from '../field/schemas/field.schema';

// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@ApiTags('Field Types')
@Controller('field-types')
export class FieldTypeController {
  constructor(private readonly fieldTypeService: FieldTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new field type' })
  @ApiBody({ type: CreateFieldTypeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Field type successfully created.',
    type: FieldTypeDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async create(
    @Body() createFieldTypeDto: CreateFieldTypeDto,
  ): Promise<FieldType> {
    return this.fieldTypeService.create(createFieldTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all field types' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Field types successfully retrieved.',
    type: [FieldTypeDto],
  })
  async findAll(): Promise<FieldType[]> {
    return this.fieldTypeService.findAll();
  }

  @Get('/related-fields/:id')
  @ApiOperation({ summary: 'Get a related fields by field type ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field Type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fields successfully retrieved.',
    type: FieldDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field type not found.',
  })
  async findRelatedFields(@Param('id') id: string): Promise<Field[]> {
    return this.fieldTypeService.findRelatedFields(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a field type by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field Type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Field type successfully retrieved.',
    type: FieldTypeDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field type not found.',
  })
  async findById(@Param('id') id: string): Promise<FieldType> {
    return this.fieldTypeService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a field type by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field Type ID' })
  @ApiBody({ type: UpdateFieldTypeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Field type successfully updated.',
    type: FieldTypeDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field type not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFieldTypeDto: UpdateFieldTypeDto,
  ): Promise<FieldType> {
    return this.fieldTypeService.update(id, updateFieldTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a field type by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field Type ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Field type successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field type not found.',
  })
  async delete(@Param('id') id: string): Promise<FieldType> {
    return this.fieldTypeService.delete(id);
  }
}
