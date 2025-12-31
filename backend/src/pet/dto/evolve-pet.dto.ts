import { IsString, IsNotEmpty } from 'class-validator';

export class EvolvePetDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;
}
