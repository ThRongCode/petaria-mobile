import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Post,
} from '@nestjs/common';
import { PetService } from './pet.service';
import { UpdatePetDto } from './dto/update-pet.dto';
import { HealPetDto } from './dto/heal-pet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pet')
@UseGuards(JwtAuthGuard)
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.petService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.petService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petService.update(id, userId, updatePetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.petService.remove(id, userId);
  }

  @Patch(':id/feed')
  feed(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.petService.feed(id, userId);
  }

  @Patch(':id/heal')
  heal(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() healPetDto: HealPetDto,
  ) {
    return this.petService.heal(id, userId, healPetDto.itemId);
  }

  @Post('heal-all')
  healAll(@CurrentUser('id') userId: string) {
    return this.petService.healAll(userId);
  }

  @Post(':id/favorite')
  addToFavorites(
    @Param('id') petId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.petService.addToFavorites(userId, petId);
  }

  @Delete(':id/favorite')
  removeFromFavorites(
    @Param('id') petId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.petService.removeFromFavorites(userId, petId);
  }

  @Get('favorites/list')
  getFavorites(@CurrentUser('id') userId: string) {
    return this.petService.getFavoritePets(userId);
  }
}
