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
  UseInterceptors,
  UploadedFile,
  UsePipes,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PublicationRequestService } from './publication-request.service';
import { CreatePublicationRequestDto } from './dto/create-publication-request.dto';
import { UpdatePublicationRequestDto } from './dto/update-publication-request.dto';
import { PublicationRequest } from './schemas/publication-request.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from 'src/minio/minio.service';
import ObjectIdValidationPipe from 'src/pipes/objectIdvalidation.pipe';
import AssginDepartmentDto from './dto/assign-department-dto';
import PaymentSetupDto from './dto/payment-setup-dto';

@ApiBearerAuth()
@ApiTags('Publication Request')
@UseGuards(JwtAuthGuard)
@Controller('publication-request')
export class PublicationRequestController {
  constructor(
    private readonly publicationRequestService: PublicationRequestService,
    private readonly minioService: MinioService,
  ) {}

  @Post('/dissmination-assign-department/:reportId')
  @UseGuards(JwtAuthGuard)
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
  async requestFinalApproval(
    @Param('reportId') reportId: string,
    @Request() req,
  ) {
    const result =
      await this.publicationRequestService.sendMessageToDissimenationHead({
        message: 'Assign A Department to the newly created publication request',
      });
    return;
  }

  @Post('/request-initial-approval/:departmentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request second approval' })
  @ApiParam({ name: 'departmentId', type: String, description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request was successfully updated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async requestSecondApproval(
    @Param('departmentId') departmentId: string,
    @Request() req,
  ) {
    const result = await this.publicationRequestService.requestInitialApproval({
      departmentId,
    });
    return result;
  }

  @Post('/request-finiance-officer/:publicationRequestId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request second approval' })
  @ApiParam({
    name: 'publicationRequestId',
    type: String,
    description: 'Report ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request was successfully updated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async requestFinianceOfficer(
    @Param('publicationRequestId') publicationRequestId: string,
    @Request() req,
  ) {
    const result = await this.publicationRequestService.requestFinianceOfficer({
      publicationRequestId,
    });
    return result;
  }

  @Post('/request-deputy/:publicationRequestId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request second approval' })
  @ApiParam({
    name: 'publicationRequestId',
    type: String,
    description: 'Report ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request was successfully updated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async requestDeputy(
    @Param('publicationRequestId') publicationRequestId: string,
    @Request() req,
  ) {
    const result = await this.publicationRequestService.RequestDeputy({
      publicationRequestId,
    });
    return result;
  }

  @Post('/request-dissmination-approved/:publicationRequestId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request second approval' })
  @ApiParam({
    name: 'publicationRequestId',
    type: String,
    description: 'Report ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Request was successfully updated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async requestDissimination(
    @Param('publicationRequestId') publicationRequestId: string,
    @Request() req,
  ) {
    const result = await this.publicationRequestService.RequestDissimination({
      publicationRequestId,
    });
    return result;
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get publication requests of the current logged in portal user',
  })
  @ApiResponse({
    status: 200,
    description:
      'The publication requests of the current logged in portal user is available',
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized access to the portal user publication request information',
  })
  async getCurrentPortalUsersPublicationRequests(@Request() req) {
    return await this.publicationRequestService.getCurrentPortalUserPublicationRequests(
      req.user.sub,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new publication request' })
  @ApiResponse({
    status: 201,
    description: 'The publication request has been created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async createPublicationRequest(
    @Body() createPublicationRequestDto: CreatePublicationRequestDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('======== in publication request ========');
    console.log(file);
    let fileUrl: string[] | null = [];

    if (file) {
      const fileName = `publication-requests/${Date.now()}_${file.originalname}`;
      const result = await this.minioService.portalUploadFile(file, fileName);
      fileUrl.push(String(result));
    }
    return this.publicationRequestService.createPublicationRequest(
      { ...createPublicationRequestDto, author: req.user.sub },
      fileUrl,
    );
  }

  @Patch('/payment-info-setup/:publicationRequestId')
  @ApiBody({
    type: PaymentSetupDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully setup payment info',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payment info',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Publication request is not found',
  })
  async setupPaymentInfo(
    @Param('publicationRequestId', new ObjectIdValidationPipe())
    publicationRequestId: string,
    @Body('price') price: number,
  ) {
    return this.publicationRequestService.paymentSetup(
      publicationRequestId,
      price,
    );
  }

  @Patch('/payment/confirm/:publicationRequestId')
  @ApiParam({
    description: 'The publication request Id',
    type: 'string',
    required: true,
    name: 'publicationRequestId',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment successfully confirmed',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Publication request not found',
  })
  async confirmPayment(
    @Param('publicationRequestId', new ObjectIdValidationPipe())
    publicationRequestId: string,
  ) {
    return this.publicationRequestService.confirmPayment(publicationRequestId);
  }

  @Patch('/initial-approval/:publicationRequestId')
  @ApiOperation({ summary: 'Approve a publication request by ID' })
  @ApiParam({
    name: 'publicationRequestId',
    type: String,
    description: 'Report ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async initalApproval(
    @Param('publicationRequestId', new ObjectIdValidationPipe())
    publicationRequestId: string,
  ) {
    return this.publicationRequestService.approve(publicationRequestId);
  }

  @Patch('/final-approval/:publicationRequestId')
  @ApiOperation({ summary: 'Final Approval for publication Request' })
  @ApiParam({
    name: 'publicationRequestId',
    type: String,
    description: 'Publication Request Id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Publication successfully approved',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async finalApproval(
    @Param('publicationRequestId', new ObjectIdValidationPipe())
    publicationRequestId: string,
  ) {
    return this.publicationRequestService.finalApproval(publicationRequestId);
  }

  @Patch('/set-file/:publicationRequestId')
  @ApiOperation({ summary: 'Set file path' })
  @ApiParam({
    name: 'fileName',
    type: String,
    description: 'File path',
  })
  @ApiParam({
    name: 'publicationRequestId',
    type: String,
    description: 'Publication Request Id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Publication file path successfully set',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async setFile(
    @Param('publicationRequestId', new ObjectIdValidationPipe())
    publicationRequestId: string,
    @Body('filePath') filePath: string,
  ) {
    return this.publicationRequestService.setFilePath(
      publicationRequestId,
      filePath,
    );
  }

  @Patch('/seconday-approval/:publicationRequestId')
  @ApiOperation({ summary: 'Secondary Approval for publication Request' })
  @ApiParam({
    name: 'publicationRequestId',
    type: String,
    description: 'Publication Request Id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Publication successfully approved',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async secondayApproval(
    @Param('publicationRequestId', new ObjectIdValidationPipe())
    publicationRequestId: string,
  ) {
    return this.publicationRequestService.secondaryApproval(
      publicationRequestId,
    );
  }

  @Patch('/initial-rejection/:publicationRequestId')
  @ApiOperation({ summary: 'Reject a publication request by Id' })
  @ApiParam({
    name: 'publicationRequestId',
    type: String,
    description: 'Publication Request ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Report successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Report not found.',
  })
  async Reject(
    @Param('publicationRequestId', new ObjectIdValidationPipe())
    publicationRequestId: string,
  ) {
    return this.publicationRequestService.reject(publicationRequestId);
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
    @Param('id', new ObjectIdValidationPipe()) id: string,
  ): Promise<PublicationRequest> {
    return this.publicationRequestService.findOne(id, req.user.sub);
  }

  @Patch('assign-department/:id')
  @ApiOperation({ summary: 'Assign department to publication request' })
  @ApiResponse({
    status: 200,
    description:
      'Publication request has been successfully assigned to a specific department',
  })
  @ApiBody({
    type: AssginDepartmentDto,
    description: 'department identifier',
  })
  @UsePipes(new ObjectIdValidationPipe())
  async assignPublicationToDepartment(
    @Body('departmentId') departmentId: string,
    @Param('id') publicationRequestId: string,
  ) {
    const result =
      await this.publicationRequestService.assignPublicationToDepartment(
        departmentId,
        publicationRequestId,
      );

    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a publication request' })
  @ApiResponse({
    status: 200,
    description: 'Publication request has been updated.',
  })
  @ApiResponse({ status: 404, description: 'Publication request not found.' })
  async update(
    @Param('id', new ObjectIdValidationPipe()) id: string,
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
  async remove(
    @Param('id', new ObjectIdValidationPipe()) id: string,
    @Request() req,
  ): Promise<void> {
    return this.publicationRequestService.remove(id, req.user.sub);
  }
}
