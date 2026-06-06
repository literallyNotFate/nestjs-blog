import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BaseUserDto } from './base-user.dto';
import { RoleResponseDto } from '@modules/role/dtos';

export class UserResponseDto extends BaseUserDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({ type: () => RoleResponseDto })
  @Expose()
  @Type(() => RoleResponseDto)
  role: RoleResponseDto;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
