import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { UserRole } from '../../user/entities/user.entity';
import { MerchantService } from '../../core/services/merchant.service';
import { CreateMerchantDto } from '../../core/dto/create-merchant.dto';
import { BranchService } from '../../core/services/branch.service';
import { CreateBranchDto } from '../../core/dto/create-branch.dto';
import { PosService } from '../../core/services/pos.service';
import { CreatePosDto } from '../../core/dto/create-pos.dto';
import { TransactionService } from '../../transactions/transaction.service';
import { CreateTransactionDto } from '../../transactions/dto/create-transaction.dto';
import { TransactionStatus } from '../../transactions/transaction.entity';
import { ExchangeType } from '../../transactions/transaction.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly userService: UserService,
    private readonly merchantService: MerchantService,
    private readonly branchService: BranchService,
    private readonly posService: PosService,
    private readonly transactionService: TransactionService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting database seeding...');

    try {
      // Only seed in development environment
      if (this.configService.get('NODE_ENV') === 'production') {
        this.logger.log('Skipping seeding in production environment');
        return;
      }

      // Check if database is already seeded by looking for existing merchants
      const existingMerchants = await this.merchantService.findAll();
      if (existingMerchants.length > 0) {
        this.logger.log('Database already contains data, skipping seeding');
        return;
      }

      this.logger.log('Database is empty, proceeding with seeding...');

      await this.createHardcodedSuperAdmin();
      const merchant = await this.createSampleMerchant();
      if (merchant) {
        const branch = await this.createSampleBranch(merchant.id);
        if (branch) {
          const pos = await this.createSamplePos(merchant.id, branch.id);
          if (pos) {
            await this.createSampleTransactions(merchant.id, branch.id, pos.id);
          }
        }
      }

      this.logger.log('Database seeding completed successfully.');
    } catch (error) {
      this.logger.error('Failed to complete database seeding.', error.stack);
    }
  }

  /**
   * Creates a hardcoded superadmin user to ensure system access.
   * This user will always be created regardless of environment configuration.
   */
  async createHardcodedSuperAdmin() {
    this.logger.log('Ensuring superadmin user exists...');

    const superadminEmail = 'superadmin@zeppex.com';
    const superadminPassword =
      this.configService.get('SUPERADMIN_PASSWORD') || 'SuperAdmin!123';

    try {
      const existingUser = await this.userService.findByEmail(superadminEmail);
      this.logger.log(`Superadmin user already exists: ${existingUser.email}`);
    } catch (error) {
      this.logger.log('Creating superadmin user...');
      const superadminUser = await this.userService.create({
        email: superadminEmail,
        password: superadminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPERADMIN,
      });
      this.logger.log(`Superadmin user created: ${superadminUser.email}`);
    }
  }

  /**
   * Creates a sample merchant for testing purposes
   */
  async createSampleMerchant() {
    this.logger.log('Creating sample merchant...');

    const sampleMerchantData: CreateMerchantDto = {
      name: 'Sample Store',
      address: '123 Main Street, Sample City, SC 12345',
      contact: 'contact@samplestore.com',
      contactName: 'John Sample',
      contactPhone: '+1234567890',
    };

    try {
      const existingMerchant = await this.merchantService.findByContact(
        sampleMerchantData.contact,
      );
      if (existingMerchant) {
        this.logger.log('Sample merchant already exists');
        return existingMerchant;
      }

      const merchant = await this.merchantService.create(sampleMerchantData);
      this.logger.log(
        `Sample merchant created: ${merchant.name} (${merchant.id})`,
      );

      // Create a sample admin user for the merchant
      await this.userService.create({
        email: 'admin@samplestore.com',
        password: 'Admin!123',
        firstName: 'Merchant',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        merchantId: merchant.id,
      });

      this.logger.log('Sample merchant admin user created');
      return merchant;
    } catch (error) {
      this.logger.error('Failed to create sample merchant:', error.message);
      return null;
    }
  }

  /**
   * Creates a sample branch for testing purposes
   */
  async createSampleBranch(merchantId: string) {
    this.logger.log('Creating sample branch...');

    const sampleBranchData: CreateBranchDto = {
      name: 'Main Store',
      address: '123 Main Street, Sample City, SC 12345',
      contactName: 'Branch Manager',
      contactPhone: '+1234567890',
    };

    try {
      const branch = await this.branchService.create(
        merchantId,
        sampleBranchData,
      );
      this.logger.log(`Sample branch created: ${branch.name} (${branch.id})`);
      return branch;
    } catch (error) {
      this.logger.error('Failed to create sample branch:', error.message);
      return null;
    }
  }

  /**
   * Creates a sample POS terminal for testing purposes
   */
  async createSamplePos(merchantId: string, branchId: string) {
    this.logger.log('Creating sample POS terminal...');

    const samplePosData: CreatePosDto = {
      name: 'Main Counter',
      description: 'Primary point of sale terminal',
      branchId: branchId,
    };

    try {
      const pos = await this.posService.create(
        merchantId,
        branchId,
        samplePosData,
      );
      this.logger.log(`Sample POS terminal created: ${pos.name} (${pos.id})`);
      return pos;
    } catch (error) {
      this.logger.error('Failed to create sample POS terminal:', error.message);
      return null;
    }
  }

  /**
   * Creates sample transactions for testing purposes
   */
  async createSampleTransactions(
    merchantId: string,
    branchId: string,
    posId: string,
  ) {
    this.logger.log('Creating sample transactions...');

    try {
      // Create sample transactions with different statuses
      const sampleTransactions: CreateTransactionDto[] = [
        {
          status: TransactionStatus.COMPLETED,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '25.50',
          exchange: ExchangeType.BINANCE,
          description: 'Coffee and pastry purchase',
        },
        {
          status: TransactionStatus.COMPLETED,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '12.99',
          exchange: ExchangeType.BINANCE,
          description: 'Lunch special',
        },
        {
          status: TransactionStatus.COMPLETED,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '45.00',
          exchange: ExchangeType.BINANCE,
          description: 'Grocery items',
        },
        {
          status: TransactionStatus.COMPLETED,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '8.75',
          exchange: ExchangeType.BINANCE,
          description: 'Snack purchase',
        },
        {
          status: TransactionStatus.COMPLETED,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '67.25',
          exchange: ExchangeType.BINANCE,
          description: 'Electronics purchase',
        },
        {
          status: TransactionStatus.COMPLETED,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '33.99',
          exchange: ExchangeType.BINANCE,
          description: 'Clothing purchase',
        },
        {
          status: TransactionStatus.COMPLETED,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '19.50',
          exchange: ExchangeType.BINANCE,
          description: 'Book purchase',
        },
        {
          status: TransactionStatus.COMPLETED,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '89.99',
          exchange: ExchangeType.BINANCE,
          description: 'Home goods purchase',
        },
        {
          status: TransactionStatus.PENDING,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '55.00',
          exchange: ExchangeType.BINANCE,
          description: 'Pending payment',
        },
        {
          status: TransactionStatus.FAILED,
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: '15.75',
          exchange: ExchangeType.BINANCE,
          description: 'Failed payment attempt',
        },
      ];

      for (const transactionData of sampleTransactions) {
        try {
          if (transactionData.status === TransactionStatus.COMPLETED) {
            // Use the new createCompleted method for completed transactions
            const transaction =
              await this.transactionService.createCompleted(transactionData);
            this.logger.log(
              `Sample completed transaction created and tokens minted: ${transaction.id} - ${transaction.description}`,
            );
          } else {
            // Create transaction with intended status
            const transaction =
              await this.transactionService.create(transactionData);
            this.logger.log(
              `Sample transaction created: ${transaction.id} - ${transaction.description} (${transactionData.status})`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to create sample transaction: ${error.message}`,
          );
        }
      }

      this.logger.log('Sample transactions creation completed');
    } catch (error) {
      this.logger.error('Failed to create sample transactions:', error.message);
    }
  }
}
