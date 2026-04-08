import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogConfigModule, BlogConfigService } from '../config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [BlogConfigModule],
      inject: [BlogConfigService],
      useFactory: (config: BlogConfigService) => ({
        type: 'postgres',
        host: config.getDbHost(),
        port: config.getDbPort(),
        username: config.getDbUser(),
        password: config.getDbPassword(),
        database: config.getDbName(),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
