import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { TenantService } from '../services/tenant.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Request() req) {
    return this.tenantService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @Request() req,
  ) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}
