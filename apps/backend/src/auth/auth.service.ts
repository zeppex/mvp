import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user/services/user.service';
import { User } from '../user/entities/user.entity';

interface RefreshTokenData {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // TODO: Replace with database storage for production
  private refreshTokens: Map<string, RefreshTokenData> = new Map();

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);

      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
      }

      return null;
    } catch (error) {
      this.logger.error(`Error validating user ${email}:`, error.message);
      return null;
    }
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      merchantId: user.merchant?.id,
      branchId: user.branch?.id,
      posId: user.pos?.id,
    };

    // Generate access token and refresh token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m'),
    });
    const refreshToken = await this.generateRefreshToken(user.id);

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        merchantId: user.merchant?.id,
        branchId: user.branch?.id,
        posId: user.pos?.id,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const refreshTokenData = this.refreshTokens.get(refreshToken);

    if (!refreshTokenData) {
      this.logger.warn(
        `Invalid refresh token attempted: ${refreshToken.substring(0, 8)}...`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token is expired
    if (refreshTokenData.expiresAt < new Date()) {
      this.refreshTokens.delete(refreshToken);
      this.logger.warn(
        `Expired refresh token attempted: ${refreshToken.substring(0, 8)}...`,
      );
      throw new UnauthorizedException('Refresh token expired');
    }

    // Get user data
    const user = await this.userService.findOne(refreshTokenData.userId);
    if (!user) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('User no longer exists');
    }

    // Create new tokens
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      merchantId: user.merchant?.id,
      branchId: user.branch?.id,
      posId: user.pos?.id,
    };

    // Generate new access token and refresh token
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m'),
    });
    const newRefreshToken = await this.generateRefreshToken(user.id);

    // Remove the old refresh token
    this.refreshTokens.delete(refreshToken);

    this.logger.log(`Token refreshed for user ${user.email}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        merchantId: user.merchant?.id,
        branchId: user.branch?.id,
        posId: user.pos?.id,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    if (this.refreshTokens.has(refreshToken)) {
      this.refreshTokens.delete(refreshToken);
      this.logger.log('User logged out successfully');
    }
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = uuidv4();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token
    this.refreshTokens.set(refreshToken, {
      userId,
      refreshToken,
      expiresAt,
      createdAt: new Date(),
    });

    return refreshToken;
  }

  // Cleanup expired refresh tokens (should be called periodically)
  cleanupExpiredTokens(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.expiresAt < now) {
        this.refreshTokens.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} expired refresh tokens`);
    }
  }
}
