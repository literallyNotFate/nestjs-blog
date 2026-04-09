import { Module } from '@nestjs/common';
import { BlogConfigModule, DatabaseModule } from './core';
import { Modules } from './modules';

@Module({
  imports: [BlogConfigModule, DatabaseModule, ...Modules],
  controllers: [],
  providers: [],
})
export class AppModule {}
