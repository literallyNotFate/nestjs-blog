import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleResponseDto } from './dtos';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Find all service
  async findAll(): Promise<RoleResponseDto[]> {
    const roles: Role[] = await this.roleRepository.find();

    return plainToInstance(RoleResponseDto, roles, {
      excludeExtraneousValues: true,
    });
  }

  // Find by name service
  async findByName(name: string): Promise<RoleResponseDto> {
    const role: Role = await this.findEntityByName(name);

    return plainToInstance(RoleResponseDto, role, {
      excludeExtraneousValues: true,
    });
  }

  // Helper function to return entity by name
  async findEntityByName(name: string): Promise<Role> {
    const role: Role | null = await this.roleRepository.findOneBy({ name });
    if (!role) {
      throw new NotFoundException(`Role with name "${name}" was not found`);
    }

    return role;
  }
}
