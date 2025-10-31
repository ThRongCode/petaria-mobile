import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdatePetDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  nickname?: string;
}
