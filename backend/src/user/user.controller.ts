import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Get('inventory')
  getInventory(@CurrentUser('id') userId: string) {
    return this.userService.getInventory(userId);
  }

  @Post('check-tickets')
  checkTickets(@CurrentUser('id') userId: string) {
    return this.userService.checkTicketReset(userId);
  }

  @Get('stats')
  getStats(@CurrentUser('id') userId: string) {
    return this.userService.getStats(userId);
  }

  @Get('settings')
  getSettings(@CurrentUser('id') userId: string) {
    return this.userService.getSettings(userId);
  }

  @Patch('settings')
  updateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.userService.updateSettings(userId, dto);
  }

  @Post('daily-login')
  claimDailyLogin(@CurrentUser('id') userId: string) {
    return this.userService.claimDailyLogin(userId);
  }

  @Get('daily-login')
  getDailyLoginStatus(@CurrentUser('id') userId: string) {
    return this.userService.getDailyLoginStatus(userId);
  }

  // DEV ONLY: Add battle tickets for testing
  @Post('dev/add-battle-tickets')
  addBattleTickets(@CurrentUser('id') userId: string) {
    return this.userService.addBattleTickets(userId);
  }

  // DEV ONLY: Add hunt tickets for testing
  @Post('dev/add-hunt-tickets')
  addHuntTickets(@CurrentUser('id') userId: string) {
    return this.userService.addHuntTickets(userId);
  }
}
