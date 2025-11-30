import { IsString, IsIn } from 'class-validator';

export class MoveDto {
  @IsString()
  sessionId: string;

  @IsString()
  @IsIn(['up', 'down', 'left', 'right'])
  direction: 'up' | 'down' | 'left' | 'right';
}
