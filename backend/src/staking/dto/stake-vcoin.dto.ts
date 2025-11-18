import { IsNumber, IsString, IsIn, Min } from 'class-validator';

export class StakeVCoinDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsIn(['IDENTITY_PREMIUM', 'CONTENT_CREATOR_PRO', 'DAO_FOUNDER', 'QUALITY_CURATOR', 'TRUSTED_MODERATOR'])
  featureType: string;

  @IsNumber()
  @Min(30)
  lockPeriodDays: number;
}

