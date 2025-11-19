import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { exec } from 'child_process';

const execPromise = util.promisify(exec);

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
    
    const videoPath = path.join(this.uploadDir, file.filename);
    const thumbnailFilename = file.filename.replace(/\.[^/.]+$/, '') + '_thumb.jpg';
    const thumbnailPath = path.join(this.uploadDir, thumbnailFilename);
    const thumbnailUrl = `${baseUrl}/uploads/${thumbnailFilename}`;
    
    // Extract video duration and generate thumbnail using ffmpeg
    let duration = 0;
    
    try {
      // Extract duration
      const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
      const { stdout: durationOutput } = await execPromise(durationCmd);
      duration = Math.round(parseFloat(durationOutput.trim()));
      
      // Generate thumbnail at 1 second mark (or 0 if video is very short)
      const thumbnailTime = duration > 1 ? '00:00:01' : '00:00:00';
      const thumbnailCmd = `ffmpeg -i "${videoPath}" -ss ${thumbnailTime} -vframes 1 -vf "scale=640:-1" "${thumbnailPath}" -y`;
      await execPromise(thumbnailCmd);
      
      // Verify thumbnail was created
      if (!fs.existsSync(thumbnailPath)) {
        throw new Error('Thumbnail generation failed');
      }
    } catch (error) {
      console.error('Video processing error:', error);
      // Return placeholder values if processing fails
      return {
        videoUrl,
        thumbnailUrl: `${baseUrl}/uploads/placeholder-thumbnail.jpg`,
        duration: 0,
      };
    }

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

