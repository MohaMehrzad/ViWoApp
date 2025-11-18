import { IsUUID, IsNumber, Min, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendVCoinDto {
  @IsUUID()
  recipientId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

