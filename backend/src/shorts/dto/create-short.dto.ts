import { IsString, IsInt, IsUrl, IsOptional, Min } from 'class-validator';

export class CreateShortDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @IsUrl()
  videoUrl: string;

  @IsString()
  @IsUrl()
  thumbnailUrl: string;

  @IsInt()
  @Min(1)
  duration: number;
}

