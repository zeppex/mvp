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
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TENANT_ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Only ADMIN can create users without tenant or for any tenant
    if (req.user.role !== UserRole.ADMIN) {
      // TENANT_ADMIN can only create users for their own tenant
      if (
        !createUserDto.tenantId ||
        createUserDto.tenantId !== req.user.tenantId
      ) {
        throw new ForbiddenException(
          'You can only create users for your tenant',
        );
      }

      // TENANT_ADMIN can't create other TENANT_ADMINs or ADMINs
      if (
        createUserDto.role === UserRole.TENANT_ADMIN ||
        createUserDto.role === UserRole.ADMIN
      ) {
        throw new ForbiddenException('You cannot create users with this role');
      }
    }

    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TENANT_ADMIN)
  async findAll(@Request() req, @Query('tenantId') tenantId?: string) {
    // ADMIN can see all users or filter by tenant
    if (req.user.role === UserRole.ADMIN) {
      if (tenantId) {
        return this.userService.findByTenant(tenantId);
      }
      return this.userService.findAll();
    }

    // TENANT_ADMIN can only see users from their own tenant
    return this.userService.findByTenant(req.user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TENANT_ADMIN)
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);

    // TENANT_ADMIN can only see users from their own tenant
    if (
      req.user.role === UserRole.TENANT_ADMIN &&
      user.tenantId !== req.user.tenantId
    ) {
      throw new ForbiddenException(
        'You cannot access users from other tenants',
      );
    }

    return user;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.TENANT_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.userService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TENANT_ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);

    // TENANT_ADMIN can only delete users from their own tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      if (user.tenantId !== req.user.tenantId) {
        throw new ForbiddenException(
          'You cannot delete users from other tenants',
        );
      }

      // TENANT_ADMIN can't delete other TENANT_ADMINs
      if (user.role === UserRole.TENANT_ADMIN) {
        throw new ForbiddenException('You cannot delete tenant administrators');
      }
    }

    return this.userService.remove(id);
  }
}
