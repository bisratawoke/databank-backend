import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus } from '@nestjs/common';
import { DataService } from './data.service';
import { CreateDataDto } from './dto/create-data.dto';
import { UpdateDataDto } from './dto/update-data.dto';
import { ApiOperation, ApiBody, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { Data } from './schemas/data.schema';
import { DataDto } from './dto/data.dto';

@ApiTags('Data')

@Controller('data')
export class DataController {
    constructor(private readonly dataService: DataService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new data entry' })
    @ApiBody({ type: CreateDataDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Data entry successfully created.', type: DataDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })

    async create(@Body() createDataDto: CreateDataDto) {
        return this.dataService.create(createDataDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all data entries' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Data entries successfully retrieved.', type: [DataDto] })
    async findAll() {
        return this.dataService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a data entry by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Data entry ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Data entry successfully retrieved.', type: DataDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Data entry not found.' })
    async findOne(@Param('id') id: string) {
        return this.dataService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a data entry by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Data entry ID' })
    @ApiBody({ type: UpdateDataDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Data entry successfully updated.', type: DataDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Data entry not found.' })
    async update(@Param('id') id: string, @Body() updateDataDto: UpdateDataDto) {
        return this.dataService.update(id, updateDataDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a data entry by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Data entry ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Data entry successfully deleted.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Data entry not found.' })
    async remove(@Param('id') id: string) {
        return this.dataService.remove(id);
    }
}
