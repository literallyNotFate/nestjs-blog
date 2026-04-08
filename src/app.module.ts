import { Module } from '@nestjs/common';
import { BlogConfigModule } from './config';

@Module({
  imports: [BlogConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
