import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'alice' })
    @IsString()
    @MinLength(3)
    username!: string;

    @ApiProperty({ example: 'alice@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'a-strong-password' })
    @IsString()
    @MinLength(8)
    password!: string;
}
