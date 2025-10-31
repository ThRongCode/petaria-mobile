import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CatchPetDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsString()
  encounterId: string;

  @IsOptional()
  @IsString()
  ballType?: string = 'pokeball';
}
