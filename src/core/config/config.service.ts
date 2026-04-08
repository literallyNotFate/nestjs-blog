import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class BlogConfigService {
  constructor(private readonly configService: NestConfigService) {}

  getPort(): number {
    return this.configService.get<number>('APP_PORT', 3000);
  }

  getDbHost(): string {
    return this.configService.get<string>('DB_HOST', '');
  }

  getDbPort(): number {
    return this.configService.get<number>('DB_PORT', 5432);
  }

  getDbUser(): string {
    return this.configService.get<string>('DB_USERNAME', '');
  }

  getDbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD', '');
  }

  getDbName(): string {
    return this.configService.get<string>('DB_DATABASE', '');
  }
}
