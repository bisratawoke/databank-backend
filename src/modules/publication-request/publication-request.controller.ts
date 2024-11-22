import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PublicationRequestService } from './publication-request.service';
import { CreatePublicationRequestDto } from './dto/create-publication-request.dto';
import { UpdatePublicationRequestDto } from './dto/update-publication-request.dto';
import { PublicationRequest } from './schemas/publication-request.schema';

@ApiBearerAuth()
@ApiTags('Publication Request')
@UseGuards(JwtAuthGuard)
@Controller('publication-request')
export class PublicationRequestController {
  constructor(
    private readonly publicationRequestService: PublicationRequestService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new publication request' })
  @ApiResponse({
    status: 201,
    description: 'The publication request has been created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(
    @Body() createDto: CreatePublicationRequestDto,
    @Req() req: any,
  ): Promise<PublicationRequest> {
    return this.publicationRequestService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all publication requests' })
  @ApiResponse({ status: 200, description: 'List of publication requests.' })
  async findAll(@Request() req): Promise<PublicationRequest[]> {
    return this.publicationRequestService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a publication request by ID' })
  @ApiResponse({ status: 200, description: 'Publication request details.' })
  @ApiResponse({ status: 404, description: 'Publication request not found.' })
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PublicationRequest> {
    return this.publicationRequestService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a publication request' })
  @ApiResponse({
    status: 200,
    description: 'Publication request has been updated.',
  })
  @ApiResponse({ status: 404, description: 'Publication request not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePublicationRequestDto,
    @Request() req,
  ): Promise<PublicationRequest> {
    return this.publicationRequestService.update(id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a publication request' })
  @ApiResponse({
    status: 200,
    description: 'Publication request has been deleted.',
  })
  @ApiResponse({ status: 404, description: 'Publication request not found.' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.publicationRequestService.remove(id, req.user.sub);
  }
}
