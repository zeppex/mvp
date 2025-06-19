import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting database seeding...');

    try {
      // Always create the hardcoded superadmin for guaranteed access
      await this.createHardcodedSuperAdmin();

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

    // Find or create hardcoded superadmin user
    const superadminEmail = 'superadmin@zeppex.com';
    try {
      const existingUser = await this.userService.findByEmail(superadminEmail);
      this.logger.log(`Superadmin user already exists: ${existingUser.email}`);
    } catch (error) {
      this.logger.log('Creating superadmin user...');
      const superadminUser = await this.userService.create({
        email: superadminEmail,
        password: 'SuperAdmin!123',
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPERADMIN,
      });
      this.logger.log(`Superadmin user created: ${superadminUser.email}`);
    }
  }
}
