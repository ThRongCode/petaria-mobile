import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RegionService } from './region.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('region')
@UseGuards(JwtAuthGuard)
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  async listRegions(@CurrentUser() user: any) {
    return this.regionService.listRegions(user.level);
  }

  @Get(':id')
  async getRegionDetails(@Param('id') id: string, @CurrentUser() user: any) {
    return this.regionService.getRegionDetails(id, user.level);
  }

  @Get(':id/spawns')
  async getSpawns(@Param('id') id: string) {
    return this.regionService.getSpawns(id);
  }
}
