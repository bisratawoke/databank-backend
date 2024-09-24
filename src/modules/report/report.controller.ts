import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Report } from './schemas/report.schema';

@ApiTags('Reports')
@Controller('reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new report' })
    @ApiBody({ type: CreateReportDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Report successfully created.', type: Report })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    async create(@Body() createReportDto: CreateReportDto) {
        return this.reportService.create(createReportDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all reports' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Reports successfully retrieved.', type: [Report] })
    async findAll() {
        return this.reportService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a report by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Report ID' }) // Swagger doc for URL param
    @ApiResponse({ status: HttpStatus.OK, description: 'Report successfully retrieved.', type: Report })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Report not found.' })

    async findOne(@Param('id') id: string) {
        return this.reportService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a report by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Report ID' })
    @ApiBody({ type: UpdateReportDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Report successfully updated.', type: Report })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Report not found.' })
    async update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
        return this.reportService.update(id, updateReportDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a report by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Report ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Report successfully deleted.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Report not found.' })
    async remove(@Param('id') id: string) {
        return this.reportService.remove(id);
    }
}
