import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Report } from './schemas/report.schema';
import { ReportDto } from './dto/report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateStatusDto } from './dto/UpdateStatus.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update report status by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Report ID' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report status successfully updated.',
    type: ReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid report ID or input data.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.reportService.updateStatus(id, updateStatusDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Report successfully created.',
    type: ReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async create(@Body() createReportDto: CreateReportDto) {
    return this.reportService.create(createReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reports successfully retrieved.',
    type: [ReportDto],
  })
  async findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Report ID' }) // Swagger doc for URL param
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully retrieved.',
    type: ReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a report by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Report ID' })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully updated.',
    type: ReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    console.log('id:', id);
    console.log('updateReportDto:', updateReportDto);
    return this.reportService.update(id, updateReportDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async remove(@Param('id') id: string) {
    return this.reportService.remove(id);
  }
}
