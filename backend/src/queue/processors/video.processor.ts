import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import * as util from 'util';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = util.promisify(exec);

@Processor('video')
export class VideoProcessor {
  private readonly logger = new Logger(VideoProcessor.name);

  @Process('process-video')
  async handleVideoProcessing(job: Job) {
    const { videoPath, outputDir } = job.data;
    
    this.logger.log(`Processing video: ${videoPath}`);
    
    try {
      // Update job progress
      await job.progress(10);
      
      const filename = path.basename(videoPath, path.extname(videoPath));
      const thumbnailPath = path.join(outputDir, `${filename}_thumb.jpg`);
      
      // Extract video duration
      await job.progress(20);
      const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
      const { stdout: durationOutput } = await execPromise(durationCmd);
      const duration = Math.round(parseFloat(durationOutput.trim()));
      
      this.logger.log(`Video duration: ${duration} seconds`);
      
      // Generate thumbnail
      await job.progress(50);
      const thumbnailTime = duration > 1 ? '00:00:01' : '00:00:00';
      const thumbnailCmd = `ffmpeg -i "${videoPath}" -ss ${thumbnailTime} -vframes 1 -vf "scale=640:-1" "${thumbnailPath}" -y`;
      await execPromise(thumbnailCmd);
      
      // Verify thumbnail was created
      if (!fs.existsSync(thumbnailPath)) {
        throw new Error('Thumbnail generation failed');
      }
      
      await job.progress(80);
      
      // Optional: Generate video preview/compressed version
      // This can be added for optimization
      
      await job.progress(100);
      
      this.logger.log(`Video processing completed: ${videoPath}`);
      
      return {
        success: true,
        thumbnailPath,
        duration,
      };
    } catch (error) {
      this.logger.error(`Video processing failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('compress-video')
  async handleVideoCompression(job: Job) {
    const { videoPath, outputPath, quality } = job.data;
    
    this.logger.log(`Compressing video: ${videoPath}`);
    
    try {
      await job.progress(10);
      
      // Compress video using ffmpeg
      const compressCmd = `ffmpeg -i "${videoPath}" -vcodec libx264 -crf ${quality || 23} -preset medium "${outputPath}" -y`;
      await execPromise(compressCmd);
      
      await job.progress(100);
      
      this.logger.log(`Video compression completed: ${outputPath}`);
      
      return {
        success: true,
        outputPath,
      };
    } catch (error) {
      this.logger.error(`Video compression failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}

