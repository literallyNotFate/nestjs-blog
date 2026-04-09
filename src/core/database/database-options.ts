import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BlogConfigService } from '../config';

export const getTypeOrmOptions = (
  config: BlogConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.getDbHost(),
  port: config.getDbPort(),
  username: config.getDbUser(),
  password: config.getDbPassword(),
  database: config.getDbName(),
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
});
