import { Controller, Get, Param } from '@nestjs/common';
import { RoleService } from './role.service';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleResponseDto } from './dtos';

@Controller('role')
@ApiTags('Role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /// Get all roles
  @Get()
  @ApiOkResponse({
    description: 'List of all roles',
    type: RoleResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Roles were not found' })
  async getAll(): Promise<RoleResponseDto[]> {
    return await this.roleService.findAll();
  }

  /// Get role by name
  @Get(':name')
  @ApiOkResponse({
    description: 'Роль найдена',
    type: RoleResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Role was not found by this name' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getByName(@Param('name') name: string): Promise<RoleResponseDto> {
    return await this.roleService.findByName(name);
  }
}
