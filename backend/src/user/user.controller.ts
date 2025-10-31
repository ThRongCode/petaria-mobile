import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
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

  @Patch('energy')
  healEnergy(@CurrentUser() user: any) {
    return this.userService.healEnergy(user.id);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.userService.getStats(user.id);
  }
}
