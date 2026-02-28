import { IsEmail, IsString, MinLength, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 6, { message: 'Reset code must be exactly 6 digits' })
  code: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
