import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) { }

    @Post()
    async create(@Body() createReportDto: CreateReportDto) {
        return this.reportService.create(createReportDto);
    }

    @Get()
    async findAll() {
        return this.reportService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.reportService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
        return this.reportService.update(id, updateReportDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.reportService.remove(id);
    }
}
