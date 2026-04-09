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

  async findAll(): Promise<RoleResponseDto[]> {
    const roles: Role[] = await this.roleRepository.find();

    return plainToInstance(RoleResponseDto, roles, {
      excludeExtraneousValues: true,
    });
  }

  async findByName(name: string): Promise<RoleResponseDto> {
    const role: Role | null = await this.roleRepository.findOneBy({ name });
    if (!role) {
      throw new NotFoundException(`Role with name "${name}" was not found`);
    }

    return plainToInstance(RoleResponseDto, role, {
      excludeExtraneousValues: true,
    });
  }
}
