import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UseItemDto {
  @IsNotEmpty()
  @IsString()
  itemId: string;

  @IsOptional()
  @IsString()
  petId?: string;
}
