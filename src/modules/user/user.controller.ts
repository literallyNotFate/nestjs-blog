import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dtos';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get all users
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted users (for admins)',
  })
  @ApiOkResponse({ description: 'List of all users', type: [UserResponseDto] })
  getAll(
    @Query('withDeleted') withDeleted?: string,
  ): Promise<UserResponseDto[]> {
    const showDeleted: boolean = withDeleted === 'true';
    return this.userService.findAll(showDeleted);
  }

  // Get user by id
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({ description: 'Found user record', type: UserResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  // Create user
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  @ApiBadRequestResponse({ description: 'Validation error' })
  create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(data);
  }

  // Update user
  @Patch(':id')
  @ApiOperation({ summary: 'Update existing user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, data);
  }

  // Soft remove use
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user (move to archive)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiNoContentResponse({ description: 'User successfully deleted' })
  @ApiNotFoundResponse({ description: 'User not found' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.softRemove(id);
  }

  // Restore user (for admin)
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({
    description: 'User successfully restored',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found in archive' })
  restore(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.userService.restore(id);
  }
}
