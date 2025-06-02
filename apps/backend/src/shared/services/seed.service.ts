import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantService } from '../../tenant/services/tenant.service';
import { UserService } from '../../user/services/user.service';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting database seeding...');

    try {
      // Try to seed the configurable admin first
      await this.seedDefaultTenantAndAdmin();

      // Always create the hardcoded superadmin for guaranteed access
      await this.createHardcodedAdmin();

      this.logger.log('Database seeding completed successfully.');
    } catch (error) {
      this.logger.error('Failed to complete database seeding.', error.stack);
    }
  }

  async seedDefaultTenantAndAdmin() {
    // Get admin credentials from environment variables, with defaults
    const adminTenantName = this.configService.get(
      'ADMIN_TENANT_NAME',
      'admin',
    );
    const adminTenantDisplayName = this.configService.get(
      'ADMIN_TENANT_DISPLAY_NAME',
      'System Administrator',
    );
    const adminEmail = this.configService.get(
      'ADMIN_EMAIL',
      'admin@example.com',
    );
    const adminPassword = this.configService.get('ADMIN_PASSWORD', 'admin123');
    const adminFirstName = this.configService.get('ADMIN_FIRST_NAME', 'Admin');
    const adminLastName = this.configService.get('ADMIN_LAST_NAME', 'User');

    this.logger.log(
      `Seeding admin tenant: ${adminTenantName} and user: ${adminEmail}`,
    );

    // Find or create default tenant
    let defaultTenant;
    try {
      defaultTenant = await this.tenantService.findByName(adminTenantName);
      this.logger.log(
        `Default tenant found: ${defaultTenant.name} (${defaultTenant.id})`,
      );
    } catch (error) {
      this.logger.log(`Default tenant not found, creating...`);
      defaultTenant = await this.tenantService.create({
        name: adminTenantName,
        displayName: adminTenantDisplayName,
      });
      this.logger.log(
        `Default tenant created: ${defaultTenant.name} (${defaultTenant.id})`,
      );
    }

    // Find or create admin user
    let adminUser;
    try {
      adminUser = await this.userService.findByEmail(adminEmail);
      this.logger.log(`Admin user found: ${adminUser.email}`);
    } catch (error) {
      this.logger.log(`Admin user not found, creating...`);
      adminUser = await this.userService.create({
        email: adminEmail,
        password: adminPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: UserRole.ADMIN,
        tenantId: defaultTenant.id,
      });
      this.logger.log(`Admin user created: ${adminUser.email}`);
    }
  }

  /**
   * Creates a hardcoded superadmin user to ensure system access.
   * This user will always be created regardless of environment configuration.
   */
  async createHardcodedAdmin() {
    this.logger.log('Ensuring superadmin user exists...');

    // Find or create hardcoded admin tenant
    let superadminTenant;
    try {
      superadminTenant = await this.tenantService.findByName('superadmin');
      this.logger.log(`Superadmin tenant found: ${superadminTenant.id}`);
    } catch (error) {
      this.logger.log('Creating superadmin tenant...');
      superadminTenant = await this.tenantService.create({
        name: 'superadmin',
        displayName: 'System Super Administrator',
        isActive: true,
      });
      this.logger.log(`Superadmin tenant created: ${superadminTenant.id}`);
    }

    // Find or create hardcoded admin user
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
        role: UserRole.ADMIN,
        tenantId: superadminTenant.id,
      });
      this.logger.log(`Superadmin user created: ${superadminUser.email}`);
    }
  }
}
