import {
  Controller,
  Get,
  Param,
  Res,
  Req,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { createReadStream, statSync, existsSync } from 'fs';
import { join } from 'path';
import { Public } from '../common/decorators/public.decorator';

@Controller('stream')
export class VideoStreamController {
  private readonly uploadDir = join(__dirname, '..', '..', 'uploads');

  @Get('video/:filename')
  @Public()
  async streamVideo(
    @Param('filename') filename: string,
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ) {
    const videoPath = join(this.uploadDir, filename);

    // Check if file exists
    if (!existsSync(videoPath)) {
      throw new NotFoundException('Video not found');
    }

    const stat = statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');

    // Set video MIME type
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
    };
    const contentType = mimeTypes[ext || ''] || 'video/mp4';
    res.setHeader('Content-Type', contentType);

    // Enable range requests
    res.setHeader('Accept-Ranges', 'bytes');

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      // Create read stream for the specified range
      const stream = createReadStream(videoPath, { start, end });

      // Set 206 Partial Content status
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);

      // Stream the video chunk
      stream.pipe(res);
    } else {
      // No range requested, send entire file
      res.setHeader('Content-Length', fileSize);
      const stream = createReadStream(videoPath);
      stream.pipe(res);
    }
  }

  @Get('image/:filename')
  @Public()
  async streamImage(
    @Param('filename') filename: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const imagePath = join(this.uploadDir, filename);

    // Check if file exists
    if (!existsSync(imagePath)) {
      throw new NotFoundException('Image not found');
    }

    const stat = statSync(imagePath);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    // Set image MIME type
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = mimeTypes[ext || ''] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);

    // Cache control
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Length', stat.size);

    // Stream the image
    const stream = createReadStream(imagePath);
    stream.pipe(res);
  }
}

