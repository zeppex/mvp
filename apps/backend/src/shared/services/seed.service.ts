import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { UserRole } from '../../user/entities/user.entity';
import { MerchantService } from '../../merchant/services/merchant.service';
import { CreateMerchantDto } from '../../merchant/dto/create-merchant.dto';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly userService: UserService,
    private readonly merchantService: MerchantService,
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

      await this.createHardcodedSuperAdmin();
      await this.createSampleMerchant();

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
        return;
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
    } catch (error) {
      this.logger.error('Failed to create sample merchant:', error.message);
    }
  }
}
