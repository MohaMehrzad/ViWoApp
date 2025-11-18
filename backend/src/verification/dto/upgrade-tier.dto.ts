import { IsString, IsIn } from 'class-validator';

export class UpgradeTierDto {
  @IsString()
  @IsIn(['VERIFIED', 'PREMIUM', 'ENTERPRISE'])
  tier: string;
}

