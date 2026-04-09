import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogConfigModule, BlogConfigService } from '../config';
import { getTypeOrmOptions } from './database-options';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [BlogConfigModule],
      inject: [BlogConfigService],
      useFactory: (config: BlogConfigService) => getTypeOrmOptions(config),
    }),
  ],
})
export class DatabaseModule {}
