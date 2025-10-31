import { IsString, IsNotEmpty } from 'class-validator';

export class HealPetDto {
  @IsNotEmpty()
  @IsString()
  itemId: string;
}
