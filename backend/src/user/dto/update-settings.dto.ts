import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  autoFeed?: boolean;

  @IsOptional()
  @IsBoolean()
  battleAnimations?: boolean;

  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  musicEnabled?: boolean;

  @IsOptional()
  @IsString()
  language?: string;
}
