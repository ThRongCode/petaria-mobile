import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ClaimQuestDto {
  @IsString()
  questId: string;
}

export class UpdateQuestProgressDto {
  @IsString()
  targetType: string; // catch_pokemon, win_battles, evolve_pet, etc.

  @IsNumber()
  @IsOptional()
  amount?: number; // Default 1

  @IsString()
  @IsOptional()
  species?: string; // For species-specific quests

  @IsString()
  @IsOptional()
  rarity?: string; // For rarity-specific quests
}
