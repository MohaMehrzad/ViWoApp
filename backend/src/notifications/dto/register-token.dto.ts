import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  deviceType: string; // 'ios', 'android', 'web'
}

export class RemoveTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

