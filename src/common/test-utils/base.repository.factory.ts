import { ObjectLiteral } from 'typeorm';
import { EntityConstructor, MockRepository } from './types';

export class BaseRepositoryFactory<T extends ObjectLiteral> {
  private entity: EntityConstructor<T>;
  private customMethods: Record<string, jest.Mock> = {};

  constructor(entity: EntityConstructor<T>) {
    this.entity = entity;
  }

  createMockRepository(): MockRepository<T> {
    return {
      create: jest.fn().mockImplementation((dto: Partial<T>) => {
        const instance = new this.entity();
        return Object.assign(instance, dto) as T;
      }),

      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: jest.fn().mockResolvedValue(null),
      findOneBy: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),

      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
        getMany: jest.fn().mockResolvedValue([]),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      })),

      ...this.customMethods,
    } as MockRepository<T>;
  }

  addCustomMethod(name: string, implementation: jest.Mock) {
    this.customMethods[name] = implementation;
    return this;
  }
}
