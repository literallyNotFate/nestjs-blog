import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { RoleService } from '../role.service';
import { MockRepository } from '@common/test-utils/types';
import { BaseRepositoryFactory } from '@common/test-utils/base.repository.factory';
import { NotFoundException } from '@nestjs/common';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepositoryMock: MockRepository<Role>;

  beforeEach(async () => {
    const factory: BaseRepositoryFactory<Role> =
      new BaseRepositoryFactory<Role>(Role);
    roleRepositoryMock = factory.createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const mockRoles = [
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'USER' },
      ] as Role[];

      roleRepositoryMock.find?.mockResolvedValue(mockRoles);
      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(roleRepositoryMock.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no roles found', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(roleRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findByName', () => {
    it('should return a single role by name', async () => {
      const mockRole = { id: 1, name: 'ADMIN' } as Role;
      roleRepositoryMock.findOneBy?.mockResolvedValue(mockRole);

      const result = await service.findByName('ADMIN');

      expect(result).toEqual({
        id: 1,
        name: 'ADMIN',
      });

      expect(roleRepositoryMock.findOneBy).toHaveBeenCalledWith({
        name: 'ADMIN',
      });
    });

    it('should throw NotFoundException if role was not found', async () => {
      roleRepositoryMock.findOneBy?.mockResolvedValue(null);

      await expect(service.findByName('USER')).rejects.toThrow(
        NotFoundException,
      );

      expect(roleRepositoryMock.findOneBy).toHaveBeenCalledWith({
        name: 'USER',
      });
    });
  });
});
