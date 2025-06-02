import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { TenantService } from '../../tenant/services/tenant.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private tenantService: TenantService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser?: any): Promise<User> {
    // Check if user with same email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Check role assignment permissions
    if (currentUser) {
      // Only SUPERADMIN can create other SUPERADMINs or ADMINs
      if ((createUserDto.role === UserRole.SUPERADMIN || createUserDto.role === UserRole.ADMIN) && 
          currentUser.role !== UserRole.SUPERADMIN) {
        throw new ForbiddenException('Only superadmins can create admin users');
      }
      
      // TENANT_ADMIN can only create users for their own tenant
      if (currentUser.role === UserRole.TENANT_ADMIN) {
        if (!createUserDto.tenantId || createUserDto.tenantId !== currentUser.tenantId) {
          throw new ForbiddenException('Tenant admins can only create users for their own tenant');
        }
        
        // TENANT_ADMINs cannot create other TENANT_ADMINs
        if (createUserDto.role === UserRole.TENANT_ADMIN) {
          throw new ForbiddenException('Tenant admins cannot create other tenant admins');
        }
      }
    }

    // Create new user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // If tenantId is provided, check if tenant exists
    if (createUserDto.tenantId) {
      await this.tenantService.findOne(createUserDto.tenantId);
    }

    return this.userRepository.save(user);
  }

  async findAll(currentUser?: any): Promise<User[]> {
    // If it's a superadmin or admin, they can see all users
    if (!currentUser || currentUser.role === UserRole.SUPERADMIN || currentUser.role === UserRole.ADMIN) {
      return this.userRepository.find();
    }
    
    // Otherwise, users can only see users in their tenant
    return this.userRepository.find({
      where: { tenantId: currentUser.tenantId }
    });
  }

  async findByTenant(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenantId },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: any,
  ): Promise<User> {
    const user = await this.findOne(id);

    // If tenantId is being changed, verify tenant exists
    if (updateUserDto.tenantId) {
      await this.tenantService.findOne(updateUserDto.tenantId);
    }

    // If password is provided, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Check if the current user is authorized to update the user
    if (
      currentUser &&
      currentUser.role !== UserRole.ADMIN &&
      (user.tenantId !== currentUser.tenantId ||
        currentUser.role !== UserRole.TENANT_ADMIN)
    ) {
      throw new ForbiddenException(
        'You are not authorized to update this user',
      );
    }

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
