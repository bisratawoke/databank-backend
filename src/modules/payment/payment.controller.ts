import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicationPaymentService } from './payment.service';
import {
  CreatePublicationPaymentDto,
  UpdatePublicationPaymentDto,
} from './dto/payment.dto';
import PublicationPayment from './schemas/payment';

@ApiTags('Publication Payments')
@Controller('publication-payments')
export class PublicationPaymentController {
  constructor(private readonly service: PublicationPaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new publication payment' })
  @ApiResponse({
    status: 201,
    description: 'The publication payment has been created.',
  })
  async create(
    @Body() dto: CreatePublicationPaymentDto,
  ): Promise<PublicationPayment> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all publication payments' })
  @ApiResponse({ status: 200, description: 'List of publication payments.' })
  async findAll(): Promise<PublicationPayment[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a publication payment by ID' })
  @ApiResponse({ status: 200, description: 'The publication payment details.' })
  @ApiResponse({ status: 404, description: 'Publication payment not found.' })
  async findOne(@Param('id') id: string): Promise<PublicationPayment> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a publication payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'The publication payment has been updated.',
  })
  @ApiResponse({ status: 404, description: 'Publication payment not found.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePublicationPaymentDto,
  ): Promise<PublicationPayment> {
    console.log('========= in payment updating ============');
    console.log(dto);
    console.log(id);
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a publication payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'The publication payment has been deleted.',
  })
  @ApiResponse({ status: 404, description: 'Publication payment not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
