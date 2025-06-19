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
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Creation logic is now fully handled by the service with proper validation
    return this.userService.create(createUserDto, req.user);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async findAll(
    @Request() req,
    @Query('merchantId') merchantId?: string,
    @Query('branchId') branchId?: string,
  ) {
    // SUPERADMIN can see all users or filter by merchant/branch
    if (req.user.role === UserRole.SUPERADMIN) {
      if (merchantId) {
        return this.userService.findByMerchant(merchantId);
      }
      if (branchId) {
        return this.userService.findByBranch(branchId);
      }
      return this.userService.findAll(req.user);
    }

    // ADMIN can see users from their own merchant or filter by branch
    if (req.user.role === UserRole.ADMIN) {
      if (branchId) {
        return this.userService.findByBranch(branchId);
      }
      return this.userService.findByMerchant(req.user.merchantId);
    }

    // BRANCH_ADMIN can only see users from their own branch
    return this.userService.findByBranch(req.user.branchId);
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);

    // ADMIN can only see users from their own merchant
    if (
      req.user.role === UserRole.ADMIN &&
      user.merchant?.id !== req.user.merchantId
    ) {
      throw new ForbiddenException(
        'You cannot access users from other merchants',
      );
    }

    // BRANCH_ADMIN can only see users from their own branch
    if (
      req.user.role === UserRole.BRANCH_ADMIN &&
      user.branch?.id !== req.user.branchId
    ) {
      throw new ForbiddenException(
        'You cannot access users from other branches',
      );
    }

    return user;
  }

  @Put(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.userService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(id);

    // ADMIN can only delete users from their own merchant
    if (req.user.role === UserRole.ADMIN) {
      if (user.merchant?.id !== req.user.merchantId) {
        throw new ForbiddenException(
          'You cannot delete users from other merchants',
        );
      }

      // ADMIN can't delete other ADMINs
      if (user.role === UserRole.ADMIN) {
        throw new ForbiddenException('You cannot delete other administrators');
      }
    }

    // BRANCH_ADMIN can only delete users from their own branch
    if (req.user.role === UserRole.BRANCH_ADMIN) {
      if (user.branch?.id !== req.user.branchId) {
        throw new ForbiddenException(
          'You cannot delete users from other branches',
        );
      }

      // BRANCH_ADMIN can only delete CASHIERs
      if (user.role !== UserRole.CASHIER) {
        throw new ForbiddenException('You can only delete cashier users');
      }
    }

    return this.userService.remove(id);
  }
}
