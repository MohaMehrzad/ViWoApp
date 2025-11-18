import { IsString, IsOptional, MaxLength, IsUrl, IsObject, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsUrl()
  coverPhotoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
  };

  @IsOptional()
  @IsObject()
  privacySettings?: {
    profileVisibility?: 'public' | 'private';
    postsVisibility?: 'everyone' | 'followers' | 'nobody';
    messagesVisibility?: 'everyone' | 'followers' | 'nobody';
    showEmail?: boolean;
  };

  @IsOptional()
  @IsObject()
  emailNotifications?: {
    likes?: boolean;
    comments?: boolean;
    follows?: boolean;
    vcoinEarned?: boolean;
  };

  @IsOptional()
  @IsString()
  @MaxLength(42)
  walletAddress?: string;
}

