import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service';
import { BuyItemDto } from './dto/buy-item.dto';
import { UseItemDto } from './dto/use-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('item')
@UseGuards(JwtAuthGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get('catalog')
  getCatalog() {
    return this.itemService.getCatalog();
  }

  @Get(':id')
  getItemById(@Param('id') id: string) {
    return this.itemService.getItemById(id);
  }

  @Post('buy')
  buyItem(@CurrentUser('id') userId: string, @Body() buyItemDto: BuyItemDto) {
    return this.itemService.buyItem(
      userId,
      buyItemDto.itemId,
      buyItemDto.quantity,
    );
  }

  @Post('use')
  useItem(@CurrentUser('id') userId: string, @Body() useItemDto: UseItemDto) {
    return this.itemService.useItem(userId, useItemDto.itemId, useItemDto.petId);
  }
}
