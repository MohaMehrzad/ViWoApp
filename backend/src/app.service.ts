import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'ViWoApp Backend API - Token Economy System';
  }
}

