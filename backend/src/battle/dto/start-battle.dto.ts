import { IsString, IsNotEmpty } from 'class-validator';

export class StartBattleDto {
  @IsNotEmpty()
  @IsString()
  petId: string;

  @IsNotEmpty()
  @IsString()
  opponentId: string;
}
