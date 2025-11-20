import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { exec } from 'child_process';
import * as sharp from 'sharp';

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

  async processImageUpload(file: Express.Multer.File): Promise<{
    url: string;
    thumbnailUrl: string;
    mediumUrl: string;
    aspectRatio: number;
  }> {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    const imagePath = path.join(this.uploadDir, file.filename);
    const baseName = file.filename.replace(/\.[^/.]+$/, '');
    
    let aspectRatio = 16 / 9; // Default fallback
    
    try {
      // Get image metadata
      const metadata = await sharp(imagePath).metadata();
      
      if (metadata.width && metadata.height && metadata.height > 0) {
        aspectRatio = metadata.width / metadata.height;
        // Clamp to reasonable range (0.5 to 2.0)
        aspectRatio = Math.max(0.5, Math.min(aspectRatio, 2.0));
      }

      // Generate optimized versions
      const thumbnailFilename = `${baseName}_thumb.webp`;
      const mediumFilename = `${baseName}_medium.webp`;
      const fullFilename = `${baseName}_full.webp`;

      const thumbnailPath = path.join(this.uploadDir, thumbnailFilename);
      const mediumPath = path.join(this.uploadDir, mediumFilename);
      const fullPath = path.join(this.uploadDir, fullFilename);

      // Generate all sizes in parallel for speed
      await Promise.all([
        // Thumbnail: 150x150 (cropped to square)
        sharp(imagePath)
          .resize(150, 150, { fit: 'cover', position: 'center' })
          .webp({ quality: 80 })
          .toFile(thumbnailPath),
        
        // Medium: max 800px on longest side
        sharp(imagePath)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(mediumPath),
        
        // Full: max 1920px on longest side
        sharp(imagePath)
          .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 90 })
          .toFile(fullPath),
      ]);

      // Delete original file to save space
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      return {
        url: `${baseUrl}/uploads/${fullFilename}`,
        thumbnailUrl: `${baseUrl}/uploads/${thumbnailFilename}`,
        mediumUrl: `${baseUrl}/uploads/${mediumFilename}`,
        aspectRatio,
      };
    } catch (error) {
      console.error('Failed to process image with Sharp:', error);
      // Fallback to original file if processing fails
      return {
        url: `${baseUrl}/uploads/${file.filename}`,
        thumbnailUrl: `${baseUrl}/uploads/${file.filename}`,
        mediumUrl: `${baseUrl}/uploads/${file.filename}`,
        aspectRatio,
      };
    }
  }

  async processVideoUpload(file: Express.Multer.File): Promise<{
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    aspectRatio: number;
  }> {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    const videoUrl = `${baseUrl}/uploads/${file.filename}`;
    
    const videoPath = path.join(this.uploadDir, file.filename);
    const thumbnailFilename = file.filename.replace(/\.[^/.]+$/, '') + '_thumb.jpg';
    const thumbnailPath = path.join(this.uploadDir, thumbnailFilename);
    const thumbnailUrl = `${baseUrl}/uploads/${thumbnailFilename}`;
    
    // Extract video duration, aspect ratio, and generate thumbnail using ffmpeg
    let duration = 0;
    let aspectRatio = 16 / 9; // Default fallback
    
    try {
      // Extract duration
      const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
      const { stdout: durationOutput } = await execPromise(durationCmd);
      duration = Math.round(parseFloat(durationOutput.trim()));
      
      // Extract aspect ratio
      const aspectCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`;
      const { stdout: aspectOutput } = await execPromise(aspectCmd);
      const [width, height] = aspectOutput.trim().split(',').map(Number);
      
      if (width && height && height > 0) {
        aspectRatio = width / height;
        // Clamp to reasonable range (0.5 to 2.0)
        aspectRatio = Math.max(0.5, Math.min(aspectRatio, 2.0));
      }
      
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
        aspectRatio,
      };
    }

    return { videoUrl, thumbnailUrl, duration, aspectRatio };
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

