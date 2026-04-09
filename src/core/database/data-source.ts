import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { BlogConfigService } from '../config';
import { getTypeOrmOptions } from './database-options';
import { ConfigService } from '@nestjs/config';

const configService: BlogConfigService = new BlogConfigService(
  new ConfigService(),
);
const baseOptions: DataSourceOptions = getTypeOrmOptions(
  configService,
) as DataSourceOptions;

const options: DataSourceOptions & SeederOptions = {
  ...baseOptions,
  entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
  seeds: [__dirname + '/seeds/**/*.seeder{.ts,.js}'],
};

export const AppDataSource: DataSource = new DataSource(options);
