import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';
import { TicketResetUtil } from '../utils/ticketReset';
import { DailyLoginUtil } from '../utils/dailyLogin';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with default starter stats
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        level: 1,
        xp: 0,
        coins: 1000,
        gems: 50,
        huntTickets: 5,
        battleTickets: 20,
        lastHuntTicketRegen: new Date(),
        lastBattleTicketRegen: new Date(),
        petCount: 0,
        itemCount: 0,
        battlesWon: 0,
        battlesLost: 0,
        huntsCompleted: 0,
      },
    });

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        gems: user.gems,
        huntTickets: user.huntTickets,
        battleTickets: user.battleTickets,
        lastHuntTicketRegen: user.lastHuntTicketRegen,
        lastBattleTicketRegen: user.lastBattleTicketRegen,
        petCount: user.petCount,
        itemCount: user.itemCount,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Regenerate tickets based on elapsed time
    await TicketResetUtil.checkAndResetTickets(this.prisma, user.id);

    // Auto-claim daily login reward
    const dailyLoginResult = await DailyLoginUtil.claimDailyLogin(this.prisma, user.id);

    // Fetch updated user data after ticket regen + daily login
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!updatedUser) {
      throw new UnauthorizedException('User not found after login processing');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        level: updatedUser.level,
        xp: updatedUser.xp,
        coins: updatedUser.coins,
        gems: updatedUser.gems,
        huntTickets: updatedUser.huntTickets,
        battleTickets: updatedUser.battleTickets,
        lastHuntTicketRegen: updatedUser.lastHuntTicketRegen,
        lastBattleTicketRegen: updatedUser.lastBattleTicketRegen,
        petCount: updatedUser.petCount,
        itemCount: updatedUser.itemCount,
      },
      dailyLogin: dailyLoginResult,
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        xp: true,
        coins: true,
        gems: true,
        huntTickets: true,
        battleTickets: true,
        lastHuntTicketRegen: true,
        lastBattleTicketRegen: true,
        petCount: true,
        itemCount: true,
      },
    });
  }

  /**
   * Forgot Password - generates a reset token.
   * In production, this would send an email with the token/link.
   * For now, it returns the token directly for mobile deep-link flow.
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message: 'If an account with that email exists, a reset code has been sent.',
      };
    }

    // Generate a 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetCodeHash = await bcrypt.hash(resetCode, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store hash + expiry in DB
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetHash: resetCodeHash,
        passwordResetExpires: expiresAt,
      },
    });

    // In production: send email with the reset code

    return {
      message: 'If an account with that email exists, a reset code has been sent.',
      // Include reset code in dev mode for testing
      ...(process.env.NODE_ENV !== 'production' && { resetCode }),
    };
  }

  /**
   * Reset Password using email + 6-digit code from forgot-password flow
   */
  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordResetHash || !user.passwordResetExpires) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Check expiry
    if (new Date() > user.passwordResetExpires) {
      // Clear expired token
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetHash: null, passwordResetExpires: null },
      });
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }

    // Verify the 6-digit code
    const isCodeValid = await bcrypt.compare(code, user.passwordResetHash);
    if (!isCodeValid) {
      throw new BadRequestException('Invalid reset code');
    }

    // Hash new password and clear reset fields
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetHash: null,
        passwordResetExpires: null,
      },
    });

    return {
      message: 'Password has been reset successfully',
    };
  }
}
