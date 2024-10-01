import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, Patch } from '@nestjs/common';
import { DataService } from './data.service';
import { CreateDataDto, CreateMultipleDataDto } from './dto/create-data.dto';
import { UpdateDataDto, UpdateMultipleDataDto } from './dto/update-data.dto';
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

    @Post('bulk')
    @ApiOperation({ summary: 'Create multiple data entries' })
    @ApiBody({ type: CreateMultipleDataDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Data entries successfully created.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    async createMultiple(@Body() createMultipleDataDto: CreateMultipleDataDto) {
        return this.dataService.createMultiple(createMultipleDataDto.dataEntries);
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

    // @Patch(':id')
    // @ApiOperation({ summary: 'Update data entries for a specific report' })
    // @ApiParam({ name: 'id', type: String, description: 'Report ID' })
    // @ApiBody({ type: UpdateMultipleDataDto })
    // @ApiResponse({ status: HttpStatus.OK, description: 'Data entry successfully updated.', type: [DataDto] })
    // @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Report not found.' })
    // async update(@Param('id') id: string, @Body() updateMultipleDataDto: UpdateMultipleDataDto) {
    //     return this.dataService.update(id, updateMultipleDataDto);
    // }

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
