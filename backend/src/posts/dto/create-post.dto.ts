import { IsString, IsOptional, MaxLength, IsIn, IsNumber, Min, Max } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsString()
  @IsIn(['image', 'video'])
  mediaType?: 'image' | 'video';

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  mediaThumbnail?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10)
  aspectRatio?: number;
}

