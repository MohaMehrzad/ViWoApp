import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  threadId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}

export class CreateThreadDto {
  @IsString({ each: true })
  @IsNotEmpty()
  participantIds: string[];
}

