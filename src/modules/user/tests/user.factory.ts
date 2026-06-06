import { RoleEnum } from '@common/enums';
import { User } from '../entities/user.entity';
import { Role } from '@modules/role/entities/role.entity';
import { UserResponseDto } from '../dtos';
import { plainToInstance } from 'class-transformer';

export const createMockUser = (overrides: Partial<User> = {}): User => {
  const user = new User();

  const defaultValues: Partial<User> = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    password: 'hashed_password_123',
    firstName: 'John',
    lastName: 'Doe',
    role: {
      id: 2,
      name: RoleEnum.USER,
      users: [],
    } as Role,
    posts: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  Object.assign(user, defaultValues, overrides);
  return user;
};

export const createMockUserDto = (
  overrides: Partial<User> = {},
): UserResponseDto => {
  const entity = createMockUser(overrides);

  return plainToInstance(UserResponseDto, entity, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
  });
};

export const createMockUsers = (count: number): User[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: `uuid-${i}`,
      email: `user${i}@test.com`,
    }),
  );
};

export const createMockUserDtos = (count: number): UserResponseDto[] => {
  return createMockUsers(count).map((entity) =>
    plainToInstance(UserResponseDto, entity, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    }),
  );
};
