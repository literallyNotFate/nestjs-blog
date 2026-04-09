import { Role } from '@modules/role/entities/role.entity';
import { DataSource, Repository } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository: Repository<Role> = dataSource.getRepository(Role);

    await repository.upsert(
      [
        { id: 1, name: 'admin' },
        { id: 2, name: 'author' },
        { id: 3, name: 'reader' },
      ],
      ['name'],
    );
  }
}
