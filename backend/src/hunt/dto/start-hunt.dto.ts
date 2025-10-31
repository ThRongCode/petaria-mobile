import { IsString, IsNotEmpty } from 'class-validator';

export class StartHuntDto {
  @IsNotEmpty()
  @IsString()
  regionId: string;
}
