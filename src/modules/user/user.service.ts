import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dtos';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { RoleService } from '@modules/role/role.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RoleService,
  ) {}

  // Find all service with deleted
  async findAll(withDeleted?: boolean): Promise<UserResponseDto[]> {
    const users: User[] = await this.userRepository.find({
      relations: ['role'],
      withDeleted,
    });

    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  // Find by id service
  async findById(id: string): Promise<UserResponseDto> {
    const user: User | null = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user)
      throw new NotFoundException('User was not found by the provided ID');

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // Create user service
  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, role: roleName, ...userData } = data;

    const existingUser: User | null = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const role = await this.rolesService.findByName(roleName);
    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    const salt: string = await bcrypt.genSalt(10);
    const hashed: string = await bcrypt.hash(password, salt);

    const newUser: User = this.userRepository.create({
      ...userData,
      email,
      password: hashed,
      role,
    });

    const savedUser: User = await this.userRepository.save(newUser);
    return plainToInstance(UserResponseDto, savedUser, {
      excludeExtraneousValues: true,
    });
  }

  // Update user service
  async update(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User was not found by the provided ID');
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const { role: roleName, ...otherData } = data;
    if (roleName) {
      const roleEntity = await this.rolesService.findEntityByName(roleName);
      user.role = roleEntity;
    }

    this.userRepository.merge(user, otherData);
    const updatedUser: User = await this.userRepository.save(user);

    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  // Soft remove of a user (for recovering)
  async softRemove(id: string): Promise<void> {
    const user: User | null = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User was not found by the provided ID');
    }

    await this.userRepository.softRemove(user);
  }

  // Restore (only for admin)
  async restore(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['role'],
    });

    if (!user)
      throw new NotFoundException('User was not found by the provided ID');
    if (!user.deletedAt) throw new BadRequestException('User is not deleted');

    await this.userRepository.recover(user);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
