import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../user/services/user.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  // In-memory refresh token store (should be replaced with database storage for production)
  private refreshTokens: Map<string, { userId: string; refreshToken: string; expiresAt: Date }> = new Map();
  
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tenantId: user.tenant?.id,
    };

    // Generate access token and refresh token
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenant?.id,
      },
      accessToken,
      refreshToken,
    };
  }
  
  async refreshToken(refreshToken: string) {
    const refreshTokenData = this.refreshTokens.get(refreshToken);
    
    if (!refreshTokenData) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    // Check if refresh token is expired
    if (refreshTokenData.expiresAt < new Date()) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }
    
    // Get user data
    const user = await this.userService.findOne(refreshTokenData.userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    
    // Create new tokens
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      tenantId: user.tenant?.id,
    };

    // Generate new access token and refresh token
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.generateRefreshToken(user.id);

    // Remove the old refresh token
    this.refreshTokens.delete(refreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenant?.id,
      },
    };
  }
  
  private generateRefreshToken(userId: string): string {
    const refreshToken = uuidv4();
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Store refresh token
    this.refreshTokens.set(refreshToken, {
      userId,
      refreshToken,
      expiresAt,
    });
    
    return refreshToken;
  }
}
