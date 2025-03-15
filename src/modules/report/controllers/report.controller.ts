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
  Request,
  Query,
} from '@nestjs/common';
import { ReportService } from '../report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportDto } from '../dto/report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { UpdateStatusDto } from '../dto/UpdateStatus.dto';
import { RolesGuard } from 'src/modules/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/modules/auth/constants/user-role';
import { PortalRoles } from 'src/decorators/portal-roles.decorator';
import { PortalUserRole } from 'src/modules/auth/constants/portal-user-role';
import { PaginationQueryDto } from 'src/common/dto/paginated-query.dto';
import { DataDto } from 'src/modules/data/dto/data.dto';
import { FieldDto } from 'src/modules/field/dto/field.dto';
import { ReportQueryDto } from '../dto/report-query.dto';
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@ApiTags('Reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

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
  @UseGuards(JwtAuthGuard)
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
  async create(@Body() createReportDto: CreateReportDto, @Request() req) {
    console.log('=========== in create retport ======');
    return this.reportService.create({
      report: { ...createReportDto, author: req.user.sub },
    });
  }

  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reports successfully retrieved.',
    type: [ReportDto],
  })
  // @Roles(
  //   UserRole.ADMIN,
  //   UserRole.DEPARTMENT_HEAD,
  //   UserRole.DISSEMINATION_HEAD,
  //   UserRole.PORTAL_USER,
  //   UserRole.DEPUTY_DIRECTOR,
  // )
  @Get()
  async findAll() {
    return this.reportService.findAll();
  }

  @ApiOperation({ summary: 'Get all reports pages' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reports successfully retrieved.',
    type: [ReportDto],
  })
  // @Roles(
  //   UserRole.ADMIN,
  //   UserRole.DEPARTMENT_HEAD,
  //   UserRole.DISSEMINATION_HEAD,
  //   UserRole.PORTAL_USER,
  //   UserRole.DEPUTY_DIRECTOR,
  // )
  @Get('pages')
  async findPages() {
    console.log('============== in find page ============');
    return this.reportService.findAllUnAuth();
  }

  @ApiOperation({ summary: 'Get all reports paginated' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reports successfully retrieved.',
    type: [ReportDto],
  })
  @Roles(
    UserRole.ADMIN,
    UserRole.DEPARTMENT_HEAD,
    UserRole.DISSEMINATION_HEAD,
    UserRole.PORTAL_USER,
    UserRole.DEPUTY_DIRECTOR,
    UserRole.DEPARTMENT_EXPERT,
  )
  @Get('/all')
  async findAllPaginated(@Query() query: ReportQueryDto) {
    return this.reportService.findAllPaginated(query);
  }

  @Get('/:reportId/fields')
  @ApiOperation({ summary: 'Get fields of a report by ID' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' }) // Swagger doc for URL param
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fields successfully retrieved.',
    type: [FieldDto],
  })
  async getReportFields(
    @Param('reportId') reportId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.reportService.findReportFields(reportId, query);
  }

  @Get('/:reportId/data')
  @ApiOperation({ summary: 'Get data of a report by ID' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' }) // Swagger doc for URL param
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Data successfully retrieved.',
    type: [DataDto],
  })
  async getReportData(
    @Param('reportId') reportId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.reportService.findReportData(reportId, query);
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
    console.log('============== in find one ============');
    return this.reportService.findOne(id);
  }

  @Get('/:reportId/single')
  @ApiOperation({ summary: 'Get a report by ID un populated' })
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
  async findOneSingle(@Param('id') id: string) {
    return this.reportService.findOneNotPopulated(id);
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
    console.log('========= hit me ========');
    console.log(updateReportDto);
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

  @Post('/is-head/:reportId')
  @ApiOperation({ summary: 'Request to verify if i am head' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request was successfully submitted',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async IsDepartmentHead(@Param('reportId') reportId: string, @Request() req) {
    const result = await this.reportService.isReportDepartmentHead({
      reportId,
      from: req.user.sub,
    });
    return {
      result,
    };
  }

  @Post('/request-initial-approval/:reportId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request initial approval' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request was successfully submitted',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async RequestInitialApproval(
    @Param('reportId') reportId: string,
    @Request() req,
  ) {
    return this.reportService.requestInitialApproval({
      reportId,
      from: req.user.sub,
    });
  }

  @Post('/initial-request-response/:reportId')
  @ApiOperation({ summary: 'Response to inital appoval request' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request was successfully updated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async InitialRequestResponse(
    @Request() req,
    @Body('status') status: string,
    @Param('reportId') reportId: string,
  ) {
    const result = await this.reportService.initialRequestResponse(
      status,
      reportId,
      req.user.sub,
    );

    return;
  }

  @Post('/request-second-approval/:reportId')
  @ApiOperation({ summary: 'Request second approval' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request was successfully updated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async requestSecondApproval(
    @Param('reportId') reportId: string,
    @Request() req,
  ) {
    const result = await this.reportService.requestSecondApproval({
      reportId,
      from: req.user.sub,
    });
    return result;
  }

  @Post('/dissemination-dept-response/:reportId')
  @ApiOperation({
    summary: 'Status update notification sent to department head',
  })
  @ApiBody({ type: UpdateStatusDto })
  @ApiParam({ name: 'reportId', type: String, description: 'Report Id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request was successfully updated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async disseminationDeptResponse(
    @Request() req,
    @Body('status') status: string,
    @Param('reportId') reportId: string,
  ) {
    return this.reportService.dissmenationDeptResponse(
      reportId,
      status,
      req.user.sub,
    );
  }

  @Patch('/approve/:reportId')
  @ApiOperation({ summary: 'Update a report by ID' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully updated.',
    type: ReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async Approve(@Param('reportId') reportId: string) {
    return this.reportService.approve(reportId);
  }

  @Patch('/reject/:reportId')
  @ApiOperation({ summary: 'Reject a report by ID' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully updated.',
    type: ReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async Reject(@Param('reportId') reportId: string) {
    return this.reportService.reject(reportId);
  }

  @Patch('/deputy-approve/:reportId')
  @ApiOperation({ summary: 'deputy approval a report by ID' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully updated.',
    type: ReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async deputyApproval(@Param('reportId') reportId: string) {
    return this.reportService.deputyApproval(reportId);
  }

  @Patch('/publish/:reportId')
  @ApiOperation({ summary: 'Publish a report by ID' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully updated.',
    type: ReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async Publish(@Param('reportId') reportId: string) {
    return this.reportService.publish(reportId);
  }

  @Get('/department/:reportId')
  @ApiOperation({ summary: 'Get department by report ID' })
  @ApiParam({ name: 'reportId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully updated.',
    type: ReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async GetDepartment(@Param('reportId') reportId: string) {
    return this.reportService.getReportParentDepartment(reportId);
  }
}
