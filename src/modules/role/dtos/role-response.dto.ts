import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RoleResponseDto {
  @ApiProperty({ type: Number, example: 1, description: 'ID of a role' })
  @Expose()
  id: number;

  @ApiProperty({
    type: String,
    example: 'user',
    description: 'Name of the role',
  })
  @Expose()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
