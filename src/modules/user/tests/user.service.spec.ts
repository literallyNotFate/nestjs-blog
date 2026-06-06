import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BaseRepositoryFactory, MockRepository } from '@common/test-utils';
import { RoleEnum } from '@common/enums';
import { Role } from '@modules/role/entities/role.entity';
import { RoleService } from '@modules/role/role.service';
import { UserService } from '../user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos';
import { createMockUser, createMockUsers } from './user.factory';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('mock-salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let userService: UserService;
  let userRepositoryMock: MockRepository<User>;
  let roleServiceMock: Partial<RoleService>;

  beforeEach(async () => {
    const userFactory = new BaseRepositoryFactory<User>(User);
    userRepositoryMock = userFactory.createMockRepository();

    roleServiceMock = {
      findEntityByName: jest.fn(),
      findByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: RoleService,
          useValue: roleServiceMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users', async () => {
      const mockEntities = createMockUsers(2);
      userRepositoryMock.find?.mockResolvedValue(mockEntities);

      const result = await userService.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UserResponseDto);
      expect(result[0].email).toBe(mockEntities[0].email);
    });

    it('should return an empty array if no users found', async () => {
      const result = await userService.findAll();

      expect(result).toEqual([]);
      expect(userRepositoryMock.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return user DTO by ID', async () => {
      const mockEntity = createMockUser({ id: 'uuid' });
      userRepositoryMock.findOne?.mockResolvedValue(mockEntity);

      const result = await userService.findById('uuid');

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).toMatchObject({ id: 'uuid', email: mockEntity.email });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepositoryMock.findOne?.mockResolvedValue(null);

      await expect(userService.findById('wrong-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      email: 'new@test.com',
      password: 'plain_password_123',
      role: RoleEnum.USER,
      firstName: 'John',
      lastName: 'Doe',
    };
    const mockRole: Role = { id: 2, name: RoleEnum.USER } as Role;

    it('should create user and return DTO', async () => {
      userRepositoryMock.findOne?.mockResolvedValue(null);
      (roleServiceMock.findByName as jest.Mock).mockResolvedValue(mockRole);

      const result = await userService.create(createDto);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe('generated-uuid');
      expect(result.email).toBe(createDto.email);
    });

    it('should hash password via bcrypt.genSalt + bcrypt.hash', async () => {
      userRepositoryMock.findOne?.mockResolvedValue(null);
      (roleServiceMock.findByName as jest.Mock).mockResolvedValue(mockRole);

      await userService.create(createDto);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 'mock-salt');
      expect(userRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed-password',
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = createMockUser({ email: createDto.email });
      userRepositoryMock.findOne?.mockResolvedValue(existingUser);

      await expect(userService.create(createDto)).rejects.toThrow(
        ConflictException,
      );

      expect(roleServiceMock.findByName).not.toHaveBeenCalled();
      expect(userRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if role does not exist', async () => {
      userRepositoryMock.findOne?.mockResolvedValue(null);
      (roleServiceMock.findByName as jest.Mock).mockResolvedValue(null);

      await expect(userService.create(createDto)).rejects.toThrow(
        new NotFoundException(`Role ${createDto.role} not found`),
      );
      expect(userRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const mockRole = { id: 3, name: RoleEnum.ADMIN, users: [] } as Role;

    it('should update partial text fields (without password/role)', async () => {
      const existingUser = createMockUser({
        id: userId,
        firstName: 'John',
        lastName: 'Doe',
      });
      const updateDto: UpdateUserDto = { firstName: 'Alex' };

      userRepositoryMock.findOne?.mockResolvedValue(existingUser);
      const result = await userService.update(userId, updateDto);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.firstName).toBe('Alex');
      expect(result.lastName).toBe('Doe');
      expect(userRepositoryMock.save).toHaveBeenCalledWith(existingUser);
      expect(roleServiceMock.findEntityByName).not.toHaveBeenCalled();
    });

    it('should successfully update password and change user role', async () => {
      const existingUser = createMockUser({
        id: userId,
        password: 'old_hashed_password',
      });
      const updateDto: UpdateUserDto = {
        password: 'new_plain_password_123',
        role: RoleEnum.ADMIN,
      };

      userRepositoryMock.findOne?.mockResolvedValue(existingUser);
      (roleServiceMock.findEntityByName as jest.Mock).mockResolvedValue(
        mockRole,
      );

      const result = await userService.update(userId, updateDto);

      expect(result).toBeInstanceOf(UserResponseDto);
      const saveMock = userRepositoryMock.save as jest.MockedFunction<
        (u: User) => Promise<User>
      >;
      const [savedUser] = saveMock.mock.calls[0];

      expect(savedUser.password).not.toBe('old_hashed_password');
      expect(savedUser.password).not.toBe('new_plain_password_123');
      expect(savedUser.role).toEqual(mockRole);
      expect(roleServiceMock.findEntityByName).toHaveBeenCalledWith(
        RoleEnum.ADMIN,
      );
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      userRepositoryMock.findOne?.mockResolvedValue(null);

      await expect(
        userService.update('wrong-id', { firstName: 'New' }),
      ).rejects.toThrow(
        new NotFoundException('User was not found by the provided ID'),
      );

      expect(userRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('softRemove', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    it('should soft remove an existing user', async () => {
      const mockUser = createMockUser({ id: userId });
      userRepositoryMock.findOne?.mockResolvedValue(mockUser);

      await userService.softRemove(userId);

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          relations: ['role'],
        }),
      );
      expect(userRepositoryMock.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user to soft remove does not exist', async () => {
      userRepositoryMock.findOne?.mockResolvedValue(null);

      await expect(userService.softRemove('wrong-id')).rejects.toThrow(
        new NotFoundException('User was not found by the provided ID'),
      );
      expect(userRepositoryMock.softRemove).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    it('should restore a soft-deleted user and return DTO', async () => {
      const deletedUser = createMockUser({ id: userId, deletedAt: new Date() });
      userRepositoryMock.findOne?.mockResolvedValue(deletedUser);

      const result = await userService.restore(userId);

      expect(result).toBeInstanceOf(UserResponseDto);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          withDeleted: true,
          relations: ['role'],
        }),
      );
      expect(userRepositoryMock.recover).toHaveBeenCalledWith(deletedUser);
      expect(deletedUser.deletedAt).toBeNull();
    });

    it('should throw NotFoundException if user to restore is not found', async () => {
      userRepositoryMock.findOne?.mockResolvedValue(null);

      await expect(userService.restore('wrong-id')).rejects.toThrow(
        new NotFoundException('User was not found by the provided ID'),
      );
      expect(userRepositoryMock.recover).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is found but not soft-deleted', async () => {
      const activeUser = createMockUser({ id: userId, deletedAt: undefined });
      userRepositoryMock.findOne?.mockResolvedValue(activeUser);

      await expect(userService.restore(userId)).rejects.toThrow(
        new BadRequestException('User is not deleted'),
      );
      expect(userRepositoryMock.recover).not.toHaveBeenCalled();
    });
  });
});
