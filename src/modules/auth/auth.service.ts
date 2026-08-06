import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly jwtExpiresIn: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.jwtExpiresIn = configService.get<string>('jwt.expiresIn') ?? '24h';
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash: passwordHash,
        first_name: dto.firstName,
        last_name: dto.lastName,
        phone: dto.phone,
        tenant_id: dto.tenantId,
        status: 'ACTIVE',
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenant_id,
      email: user.email,
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        tenantId: user.tenant_id,
      },
      accessToken,
      refreshToken,
    };
  }

  async validateUser(email: string, password: string, tenantId?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        ...(tenantId ? { tenant_id: tenantId } : {}),
      },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is not active');
    }

    const valid = await this.comparePassword(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password, dto.tenantId);

    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenant_id,
      email: user.email,
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        tenantId: user.tenant_id,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(dto.refreshToken);

      const payload: JwtPayload = {
        sub: decoded.sub,
        tenantId: decoded.tenantId,
        email: decoded.email,
      };

      const { accessToken, refreshToken } = this.generateTokens(payload);

      return {
        accessToken,
        refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout() {
    // Stateless JWT: logout is handled on client side (by deleting token).
    // If you later use user_sessions table, implement token invalidation here.
    return { success: true };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, do not reveal if user exists.
      return { success: true };
    }

    // TODO: implement token generation + email sending via Notification module
    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    // TODO: verify token from password reset store
    if (!token) {
      throw new BadRequestException('Invalid token');
    }

    // This is a stub; real implementation will live in Notification/Token store.
    return { success: true };
  }

  async verifyEmail(token: string) {
    // TODO: verify email token and mark user email as verified
    if (!token) {
      throw new BadRequestException('Invalid token');
    }
    return { success: true };
  }
}
