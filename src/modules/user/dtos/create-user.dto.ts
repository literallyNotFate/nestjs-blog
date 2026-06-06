import { IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseUserDto } from './base-user.dto';
import { RoleEnum } from '@common/enums';

export class CreateUserDto extends BaseUserDto {
  @ApiProperty({
    example: 'password123',
    description: 'Strong password for the user',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    enum: RoleEnum,
    example: RoleEnum.USER,
    description: 'User role name',
  })
  @IsEnum(RoleEnum)
  @IsNotEmpty()
  role: RoleEnum;
}
