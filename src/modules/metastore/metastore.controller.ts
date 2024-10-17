import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetastoreService } from './metastore.service';
import { Metastore } from './schemas/metastore.schema'; // Adjust the import according to your project structure
import { CreateMetastoreDto } from './dto/create-metastore.dto'; // Create DTO files for validation
import { UpdateMetastoreDto } from './dto/update-metastore.dto'; // Create DTO files for validation
import { MetastoreDto } from './dto/metastore.dto';

@ApiTags('metastore')
@Controller('metastore')
export class MetastoreController {
  constructor(private readonly metastoreService: MetastoreService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new metastore entry' })
  @ApiResponse({
    status: 201,
    description: 'The metastore has been successfully created.',
    type: Metastore,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(
    @Body() createMetastoreDto: CreateMetastoreDto,
  ): Promise<MetastoreDto> {
    return this.metastoreService.create(createMetastoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all metastore entries' })
  @ApiResponse({
    status: 200,
    description: 'Returns all metastore entries',
    type: [Metastore],
  })
  async findAll(): Promise<Metastore[]> {
    return this.metastoreService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a metastore entry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the metastore entry',
    type: Metastore,
  })
  @ApiResponse({ status: 404, description: 'Metastore not found' })
  async findOne(@Param('id') id: string): Promise<MetastoreDto> {
    return this.metastoreService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a metastore entry' })
  @ApiResponse({
    status: 200,
    description: 'The metastore entry has been successfully updated.',
    type: Metastore,
  })
  @ApiResponse({ status: 404, description: 'Metastore not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMetastoreDto: UpdateMetastoreDto,
  ): Promise<Metastore> {
    return this.metastoreService.update(id, updateMetastoreDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a metastore entry' })
  @ApiResponse({
    status: 204,
    description: 'The metastore entry has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Metastore not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.metastoreService.remove(id);
  }
}
