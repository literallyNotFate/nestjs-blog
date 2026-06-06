import { ObjectLiteral } from 'typeorm';
import { IBaseEntity } from '@common/interfaces';
import { MockRepository } from '@common/test-utils';

export class BaseRepositoryFactory<T extends IBaseEntity & ObjectLiteral> {
  private entity: new () => T;
  private customMethods: Partial<MockRepository<T>> = {};

  constructor(entity: new () => T) {
    this.entity = entity;
  }

  createMockRepository(): MockRepository<T> {
    const mockRepo: Partial<MockRepository<T>> = {
      create: jest.fn().mockImplementation((dto: Partial<T>): T => {
        const instance = new this.entity();
        return Object.assign(instance, dto) as T;
      }),

      save: jest.fn().mockImplementation((entity: T): Promise<T> => {
        const result = {
          ...entity,
          id: entity.id || 'generated-uuid',
          createdAt: entity.createdAt || new Date(),
          updatedAt: new Date(),
        } as T;
        return Promise.resolve(result);
      }),

      merge: jest.fn().mockImplementation((entity: T, dto: Partial<T>): T => {
        return Object.assign(entity, dto) as T;
      }),

      softRemove: jest.fn().mockImplementation((entity: T): Promise<T> => {
        return Promise.resolve(
          Object.assign(entity, { deletedAt: new Date() }),
        );
      }),

      recover: jest.fn().mockImplementation((entity: T): Promise<T> => {
        return Promise.resolve(Object.assign(entity, { deletedAt: null }));
      }),

      findOne: jest.fn().mockResolvedValue(null),
      findOneBy: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([] as T[]),

      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
        getMany: jest.fn().mockResolvedValue([] as T[]),
        getManyAndCount: jest.fn().mockResolvedValue([[] as T[], 0]),
      }),

      ...this.customMethods,
    };

    return mockRepo as MockRepository<T>;
  }

  setCustomMethods(methods: Partial<MockRepository<T>>): void {
    this.customMethods = methods;
  }
}
