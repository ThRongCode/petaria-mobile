import { Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id);
  }

  @Get('inventory')
  getInventory(@CurrentUser() user: any) {
    return this.userService.getInventory(user.id);
  }

  @Post('check-tickets')
  checkTickets(@CurrentUser() user: any) {
    return this.userService.checkTicketReset(user.id);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.userService.getStats(user.id);
  }

  // DEV ONLY: Add battle tickets for testing
  @Post('dev/add-battle-tickets')
  addBattleTickets(@CurrentUser() user: any) {
    return this.userService.addBattleTickets(user.id);
  }

  // DEV ONLY: Add hunt tickets for testing
  @Post('dev/add-hunt-tickets')
  addHuntTickets(@CurrentUser() user: any) {
    return this.userService.addHuntTickets(user.id);
  }
}
