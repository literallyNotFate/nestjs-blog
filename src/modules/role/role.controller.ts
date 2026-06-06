import { Controller, Get, Param, ParseEnumPipe } from '@nestjs/common';
import { RoleService } from './role.service';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RoleResponseDto } from './dtos';
import { RoleEnum } from '@common/enums';

@Controller('role')
@ApiTags('Role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Get roles
  @Get()
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiOkResponse({
    description: 'List of all roles returned successfully',
    type: [RoleResponseDto],
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  getAll(): Promise<RoleResponseDto[]> {
    return this.roleService.findAll();
  }

  // Get role by name
  @Get(':name')
  @ApiOperation({ summary: 'Get specific role details by its name' })
  @ApiParam({
    name: 'name',
    enum: RoleEnum,
    description: 'The unique name of the role',
    example: RoleEnum.USER,
  })
  @ApiOkResponse({
    description: 'Role found and returned',
    type: RoleResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Role with provided name does not exist',
  })
  @ApiBadRequestResponse({ description: 'Invalid role name provided' })
  getByName(
    @Param('name', new ParseEnumPipe(RoleEnum)) name: RoleEnum,
  ): Promise<RoleResponseDto> {
    return this.roleService.findByName(name);
  }
}
