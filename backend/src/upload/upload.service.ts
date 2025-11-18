import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async processImageUpload(file: Express.Multer.File): Promise<string> {
    // Generate URL for the uploaded file
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    return `${baseUrl}/uploads/${file.filename}`;
  }

  async processVideoUpload(file: Express.Multer.File): Promise<{
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
  }> {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    const videoUrl = `${baseUrl}/uploads/${file.filename}`;
    
    // TODO: Generate thumbnail using ffmpeg
    // For now, return placeholder
    const thumbnailUrl = `${baseUrl}/uploads/placeholder-thumbnail.jpg`;
    
    // TODO: Extract video duration
    const duration = 0;

    return { videoUrl, thumbnailUrl, duration };
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getFileUrl(filename: string): string {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    return `${baseUrl}/uploads/${filename}`;
  }
}

