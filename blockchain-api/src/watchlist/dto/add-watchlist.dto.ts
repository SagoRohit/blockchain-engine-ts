import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddWatchlistDto {
    @ApiProperty({
        description: 'Wallet address to watch',
        example: '04ab1234...',
    })
    @IsString()
    address!: string;
}
