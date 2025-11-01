import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';
import { TicketResetUtil } from '../utils/ticketReset';

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
        lastTicketReset: new Date(),
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
        lastTicketReset: user.lastTicketReset,
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

    // Check and reset tickets if needed
    await TicketResetUtil.checkAndResetTickets(this.prisma, user.id);

    // Fetch updated user data after potential ticket reset
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!updatedUser) {
      throw new UnauthorizedException('User not found after ticket reset');
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
        lastTicketReset: updatedUser.lastTicketReset,
        petCount: updatedUser.petCount,
        itemCount: updatedUser.itemCount,
      },
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
        lastTicketReset: true,
        petCount: true,
        itemCount: true,
      },
    });
  }
}
