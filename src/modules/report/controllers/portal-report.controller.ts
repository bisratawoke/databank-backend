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
import { Report } from '../schemas/report.schema';
import { ReportDto } from '../dto/report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { UpdateStatusDto } from '../dto/UpdateStatus.dto';
import { PortalRolesGuard } from 'src/modules/auth/guards/portal-roles.guard';
import { PortalRoles } from 'src/decorators/portal-roles.decorator';
import { PortalUserRole } from 'src/modules/auth/constants/portal-user-role';
import { PaginationQueryDto } from 'src/common/dto/paginated-query.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PortalRolesGuard)
@ApiTags('Portal-Reports')
@Controller('portal-reports')
export class PortalReportController {
    constructor(private readonly reportService: ReportService) { }
    @Get()
    @ApiOperation({ summary: 'Get all reports' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Reports successfully retrieved.',
        type: [ReportDto],
    })
    @PortalRoles(PortalUserRole.PORTAL_USER)
    async findAll(@Query() query: PaginationQueryDto) {
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
    @PortalRoles(PortalUserRole.PORTAL_USER)

    async findOne(@Param('id') id: string) {
        return this.reportService.findOne(id);
    }

}