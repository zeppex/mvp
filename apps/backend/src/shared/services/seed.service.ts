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
    this.logger.log('Seeding default admin data...');

    try {
      // First try to seed the configurable admin
      await this.seedDefaultTenantAndAdmin();
    } catch (error) {
      this.logger.error(
        'Failed to seed configurable admin. Creating hardcoded admin as fallback.',
        error.stack,
      );

      // Fallback to hardcoded admin if the configurable one fails
      try {
        await this.createHardcodedAdmin();
      } catch (fallbackError) {
        this.logger.error(
          'Failed to create hardcoded admin. System may lack admin access.',
          fallbackError.stack,
        );
      }
    }

    this.logger.log('Admin seeding complete.');
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

    // Check if default tenant exists
    let defaultTenantId: string;
    try {
      const defaultTenant =
        await this.tenantService.findByName(adminTenantName);
      defaultTenantId = defaultTenant.id;
      this.logger.log('Default tenant already exists');
    } catch (error) {
      // Create default tenant
      const tenant = await this.tenantService.create({
        name: adminTenantName,
        displayName: adminTenantDisplayName,
      });
      defaultTenantId = tenant.id;
      this.logger.log('Default tenant created');
    }

    // Check if admin user exists
    try {
      await this.userService.findByEmail(adminEmail);
      this.logger.log('Admin user already exists');
    } catch (error) {
      // Create admin user
      await this.userService.create({
        email: adminEmail,
        password: adminPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: UserRole.ADMIN,
        tenantId: defaultTenantId,
      });
      this.logger.log('Admin user created');
    }
  }

  /**
   * Creates a hardcoded admin user as a fallback.
   * This ensures there's always an admin account available for system access.
   */
  async createHardcodedAdmin() {
    // Create a hardcoded admin tenant
    let hardcodedTenantId: string;
    try {
      const tenant = await this.tenantService.create({
        name: 'superadmin',
        displayName: 'System Super Administrator',
      });
      hardcodedTenantId = tenant.id;
      this.logger.log('Hardcoded admin tenant created');
    } catch (error) {
      // If tenant creation fails, try to fetch existing one
      try {
        const tenant = await this.tenantService.findByName('superadmin');
        hardcodedTenantId = tenant.id;
      } catch (innerError) {
        throw new Error('Could not create or find hardcoded admin tenant');
      }
    }

    // Create a hardcoded admin user
    try {
      await this.userService.create({
        email: 'superadmin@zeppex.com',
        password: 'SuperAdmin!123', // This is hardcoded but secure for fallback purposes
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        tenantId: hardcodedTenantId,
      });
      this.logger.log('Hardcoded admin user created');
    } catch (error) {
      // Check if user already exists
      try {
        await this.userService.findByEmail('superadmin@zeppex.com');
        this.logger.log('Hardcoded admin user already exists');
      } catch (innerError) {
        throw new Error('Could not create hardcoded admin user');
      }
    }
  }
}
