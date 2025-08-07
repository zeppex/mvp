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
import { Merchant } from '../../core/entities/merchant.entity';
import { Branch } from '../../core/entities/branch.entity';
import { Pos } from '../../core/entities/pos.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(Pos)
    private posRepository: Repository<Pos>,
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

    // Check role assignment permissions and validate relationships
    if (currentUser) {
      // Only SUPERADMIN can create other SUPERADMINs
      if (
        createUserDto.role === UserRole.SUPERADMIN &&
        currentUser.role !== UserRole.SUPERADMIN
      ) {
        throw new ForbiddenException(
          'Only superadmins can create other superadmin users',
        );
      }

      // ADMIN users can only create users for their own merchant
      if (currentUser.role === UserRole.ADMIN) {
        if (
          !createUserDto.merchantId ||
          createUserDto.merchantId !== currentUser.merchantId
        ) {
          throw new ForbiddenException(
            'Admins can only create users for their own merchant',
          );
        }

        // ADMINs cannot create other ADMINs
        if (createUserDto.role === UserRole.ADMIN) {
          throw new ForbiddenException(
            'Admins cannot create other admin users',
          );
        }
      }

      // BRANCH_ADMIN users can only create users for their own branch
      if (currentUser.role === UserRole.BRANCH_ADMIN) {
        if (
          !createUserDto.branchId ||
          createUserDto.branchId !== currentUser.branchId
        ) {
          throw new ForbiddenException(
            'Branch admins can only create users for their own branch',
          );
        }

        // BRANCH_ADMINs can only create CASHIERs
        if (createUserDto.role !== UserRole.CASHIER) {
          throw new ForbiddenException(
            'Branch admins can only create cashier users',
          );
        }
      }
    }

    // Validate merchant, branch, and pos relationships
    let merchant = null;
    let branch = null;
    let pos = null;

    if (createUserDto.merchantId) {
      merchant = await this.merchantRepository.findOne({
        where: { id: createUserDto.merchantId },
      });
      if (!merchant) {
        throw new NotFoundException(
          `Merchant with ID ${createUserDto.merchantId} not found`,
        );
      }
    }

    if (createUserDto.branchId) {
      branch = await this.branchRepository.findOne({
        where: { id: createUserDto.branchId },
        relations: ['merchant'],
      });
      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${createUserDto.branchId} not found`,
        );
      }
      // Ensure branch belongs to the specified merchant
      if (
        createUserDto.merchantId &&
        branch.merchant?.id !== createUserDto.merchantId
      ) {
        // If merchant relationship is null, try to get it from the branch directly
        if (!branch.merchant) {
          const branchWithMerchant = await this.branchRepository.findOne({
            where: { id: branch.id },
            relations: ['merchant'],
          });
          if (branchWithMerchant?.merchant?.id !== createUserDto.merchantId) {
            throw new ForbiddenException(
              'Branch does not belong to the specified merchant',
            );
          }
        } else {
          throw new ForbiddenException(
            'Branch does not belong to the specified merchant',
          );
        }
      }
    }

    if (createUserDto.posId) {
      pos = await this.posRepository.findOne({
        where: { id: createUserDto.posId },
        relations: ['branch', 'branch.merchant'],
      });
      if (!pos) {
        throw new NotFoundException(
          `POS with ID ${createUserDto.posId} not found`,
        );
      }
      // Ensure pos belongs to the specified branch
      if (createUserDto.branchId && pos.branch.id !== createUserDto.branchId) {
        throw new ForbiddenException(
          'POS does not belong to the specified branch',
        );
      }
    }

    // Create new user
    const user = this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role || UserRole.CASHIER,
      merchant,
      branch,
      pos,
    });

    return this.userRepository.save(user);
  }

  async findAll(currentUser?: any): Promise<User[]> {
    // If it's a superadmin, they can see all users
    if (!currentUser || currentUser.role === UserRole.SUPERADMIN) {
      return this.userRepository.find({
        relations: ['merchant', 'branch', 'pos'],
      });
    }

    // If it's an admin, they can see all users in their merchant
    if (currentUser.role === UserRole.ADMIN) {
      return this.userRepository.find({
        where: {
          merchant: { id: currentUser.merchantId },
        },
        relations: ['merchant', 'branch', 'pos'],
      });
    }

    // If it's a branch admin, they can see users in their branch
    if (currentUser.role === UserRole.BRANCH_ADMIN) {
      return this.userRepository.find({
        where: {
          branch: { id: currentUser.branchId },
        },
        relations: ['merchant', 'branch', 'pos'],
      });
    }

    // Cashiers can only see themselves
    return this.userRepository.find({
      where: { id: currentUser.sub },
      relations: ['merchant', 'branch', 'pos'],
    });
  }

  async findByMerchant(merchantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        merchant: { id: merchantId },
      },
      relations: ['merchant', 'branch', 'pos'],
    });
  }

  async findByBranch(branchId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        branch: { id: branchId },
      },
      relations: ['merchant', 'branch', 'pos'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['merchant', 'branch', 'pos'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['merchant', 'branch', 'pos'],
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: any,
  ): Promise<User> {
    const user = await this.findOne(id);

    // Validate and update relationships if they are being changed
    if (updateUserDto.merchantId) {
      const merchant = await this.merchantRepository.findOne({
        where: { id: updateUserDto.merchantId },
      });
      if (!merchant) {
        throw new NotFoundException(
          `Merchant with ID ${updateUserDto.merchantId} not found`,
        );
      }
    }

    if (updateUserDto.branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: updateUserDto.branchId },
        relations: ['merchant'],
      });
      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${updateUserDto.branchId} not found`,
        );
      }
      // Ensure branch belongs to the specified merchant
      if (
        updateUserDto.merchantId &&
        branch.merchant.id !== updateUserDto.merchantId
      ) {
        throw new ForbiddenException(
          'Branch does not belong to the specified merchant',
        );
      }
    }

    if (updateUserDto.posId) {
      const pos = await this.posRepository.findOne({
        where: { id: updateUserDto.posId },
        relations: ['branch'],
      });
      if (!pos) {
        throw new NotFoundException(
          `POS with ID ${updateUserDto.posId} not found`,
        );
      }
      // Ensure pos belongs to the specified branch
      if (updateUserDto.branchId && pos.branch.id !== updateUserDto.branchId) {
        throw new ForbiddenException(
          'POS does not belong to the specified branch',
        );
      }
    }

    // If password is provided, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Check if the current user is authorized to update the user
    if (currentUser && currentUser.role !== UserRole.SUPERADMIN) {
      // Admins can only update users in their merchant
      if (currentUser.role === UserRole.ADMIN) {
        if (user.merchant?.id !== currentUser.merchantId) {
          throw new ForbiddenException(
            'You are not authorized to update this user',
          );
        }
      }
      // Branch admins can only update users in their branch
      else if (currentUser.role === UserRole.BRANCH_ADMIN) {
        if (user.branch?.id !== currentUser.branchId) {
          throw new ForbiddenException(
            'You are not authorized to update this user',
          );
        }
      }
      // Cashiers can only update themselves
      else if (currentUser.role === UserRole.CASHIER) {
        if (user.id !== currentUser.sub) {
          throw new ForbiddenException(
            'You are not authorized to update this user',
          );
        }
      }
    }

    // Update relationships
    if (updateUserDto.merchantId) {
      user.merchant = await this.merchantRepository.findOne({
        where: { id: updateUserDto.merchantId },
      });
    }
    if (updateUserDto.branchId) {
      user.branch = await this.branchRepository.findOne({
        where: { id: updateUserDto.branchId },
      });
    }
    if (updateUserDto.posId) {
      user.pos = await this.posRepository.findOne({
        where: { id: updateUserDto.posId },
      });
    }

    // Update other fields
    Object.assign(user, {
      email: updateUserDto.email,
      password: updateUserDto.password,
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      role: updateUserDto.role,
      isActive: updateUserDto.isActive,
    });

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
