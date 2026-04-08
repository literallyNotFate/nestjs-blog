import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class BlogConfigService {
  constructor(private readonly configService: NestConfigService) {}

  getPort(): number {
    return this.configService.get<number>('APP_PORT', 3000);
  }
}
