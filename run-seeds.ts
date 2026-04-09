import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env.development.local') });

import { runSeeders } from 'typeorm-extension';
import { AppDataSource } from '@core/database';

async function run(): Promise<void> {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected!');

    console.log('Running seeders...');
    await runSeeders(AppDataSource);
    console.log('All seeders ran successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    process.exit();
  }
}

void run();
