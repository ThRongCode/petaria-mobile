import { IsString, IsNotEmpty, IsBoolean, IsInt, Min } from 'class-validator';

export class CompleteBattleDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsBoolean()
  won: boolean;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  damageDealt: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  damageTaken: number;
}
