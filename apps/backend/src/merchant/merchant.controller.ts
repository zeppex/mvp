import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { Merchant } from './merchant.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UUID } from 'crypto';

@ApiTags('merchants')
@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiResponse({ status: 201, description: 'Merchant successfully created.', type: Merchant })
  @ApiBody({ type: CreateMerchantDto })
  create(@Body() createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    return this.merchantService.create(createMerchantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all merchants' })
  @ApiResponse({ status: 200, description: 'Return all merchants.', type: [Merchant] })
  findAll(): Promise<Merchant[]> {
    return this.merchantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a merchant by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Merchant ID', type: Number })
  @ApiResponse({ status: 200, description: 'Return the merchant.', type: Merchant })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  findOne(@Param('id') id: UUID): Promise<Merchant> {
    return this.merchantService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a merchant by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Merchant ID', type: Number })
  @ApiResponse({ status: 204, description: 'Merchant successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  remove(@Param('id') id: UUID): Promise<void> {
    return this.merchantService.remove(id);
  }
}
