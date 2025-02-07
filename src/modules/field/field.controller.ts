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
import { FieldService } from './field.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FieldDto } from './dto/field.dto';
import { Field } from './schemas/field.schema';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Data } from '../data/schemas/data.schema';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Fields')
@Controller('fields')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new field' })
  @ApiBody({ type: CreateFieldDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Field successfully created.',
    type: FieldDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async create(@Body() createFieldDto: CreateFieldDto): Promise<Field> {
    return this.fieldService.create(createFieldDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fields' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fields successfully retrieved.',
    type: [FieldDto],
  })
  async findAll(): Promise<Field[]> {
    return this.fieldService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a field by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Field successfully retrieved.',
    type: FieldDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field not found.',
  })
  async findById(@Param('id') id: string): Promise<Field> {
    return this.fieldService.findById(id);
  }
  @Get('/related-data/:id')
  @ApiOperation({ summary: 'Get related data by field ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data successfully retrieved.',
    type: FieldDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field not found.',
  })
  async findRelatedDatafindRelatedData(
    @Param('id') id: string,
  ): Promise<Data[]> {
    return this.fieldService.findRelatedData(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a field by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field ID' })
  @ApiBody({ type: UpdateFieldDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Field successfully updated.',
    type: FieldDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFieldDto: UpdateFieldDto,
  ): Promise<Field> {
    return this.fieldService.update(id, updateFieldDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a field by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Field ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Field successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Field not found.',
  })
  async delete(@Param('id') id: string): Promise<Field> {
    return this.fieldService.delete(id);
  }
}
