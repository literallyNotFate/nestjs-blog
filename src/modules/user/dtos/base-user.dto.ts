import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BaseUserDto {
  @ApiProperty({
    type: String,
    example: 'John',
    description: 'First name of a user',
  })
  @IsNotEmpty()
  @Length(2, 20)
  @Expose()
  firstName: string;

  @ApiProperty({
    type: String,
    example: 'Doe',
    description: 'Last name of a user',
  })
  @IsNotEmpty()
  @Length(2, 20)
  @Expose()
  lastName: string;

  @ApiProperty({
    type: String,
    example: 'example@gmail.com',
    description: 'Email of a user',
  })
  @IsEmail()
  @Expose()
  email: string;
}
