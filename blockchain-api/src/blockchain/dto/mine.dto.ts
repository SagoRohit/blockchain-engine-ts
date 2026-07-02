import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
export class MineDto {
    @ApiProperty({
        description: 'Miner wallet address',
        example: '04ab1234...',
    })
    @IsString()
    minerAddress!: string;
}