import { Module } from '@nestjs/common';
import { BlogConfigModule, DatabaseModule } from './core';

@Module({
  imports: [BlogConfigModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
