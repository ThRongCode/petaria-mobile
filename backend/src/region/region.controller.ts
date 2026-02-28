import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RegionService } from './region.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('region')
@UseGuards(JwtAuthGuard)
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  listRegions(@CurrentUser('level') userLevel: number) {
    return this.regionService.listRegions(userLevel);
  }

  @Get(':id')
  getRegionDetails(@Param('id') id: string, @CurrentUser('level') userLevel: number) {
    return this.regionService.getRegionDetails(id, userLevel);
  }

  @Get(':id/spawns')
  getSpawns(@Param('id') id: string) {
    return this.regionService.getSpawns(id);
  }
}
