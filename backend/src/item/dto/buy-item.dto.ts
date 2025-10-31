import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class BuyItemDto {
  @IsNotEmpty()
  @IsString()
  itemId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}
