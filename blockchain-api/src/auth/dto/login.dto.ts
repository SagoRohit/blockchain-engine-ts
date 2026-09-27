import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'alice' })
    @IsString()
    username!: string;

    @ApiProperty({ example: 'a-strong-password' })
    @IsString()
    password!: string;
}
