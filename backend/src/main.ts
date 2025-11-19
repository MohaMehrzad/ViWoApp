import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import * as express from 'express';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Request size limits - Prevent DoS attacks
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Enable compression
  app.use(compression());

  // Security - Configure Helmet with proper CSP for video streaming
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          mediaSrc: ["'self'", 'data:', 'blob:', '*'],
          imgSrc: ["'self'", 'data:', 'blob:', '*'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", '*'],
        },
      },
    }),
  );

  // CORS - Must be before static assets
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [];
  
  // In development, allow localhost if no CORS_ORIGIN is set
  if (process.env.NODE_ENV !== 'production' && corsOrigins.length === 0) {
    corsOrigins.push('http://localhost:8081', 'http://192.168.31.158:8081');
  }
  
  // In production, enforce CORS_ORIGIN environment variable
  if (process.env.NODE_ENV === 'production' && corsOrigins.length === 0) {
    throw new Error('CORS_ORIGIN must be set in production environment');
  }
  
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  });

  // Serve uploaded files with proper headers for video streaming
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res, path, stat) => {
      // Enable CORS for uploaded files
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
      
      // Enable range requests for video streaming
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Cache control
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      // Set proper MIME types for videos
      if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (path.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
      } else if (path.endsWith('.mov')) {
        res.setHeader('Content-Type', 'video/quicktime');
      }
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/v1`);
  console.log(`📁 File uploads: http://localhost:${port}/uploads/`);
}

bootstrap();

