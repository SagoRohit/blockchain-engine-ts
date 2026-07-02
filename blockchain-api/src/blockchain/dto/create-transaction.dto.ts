import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
        description: 'Sender wallet address',
        example: '04ab1234...',
    })
  @IsString()
  from!: string;


  @ApiProperty({
        description: 'Receiver wallet address',
        example: '04ab1234...',
    })
  @IsString()
  to!: string;


  @ApiProperty({
        description: 'Amount to sent',
        example: '50',
    })
  @IsNumber()
  @IsPositive()
  amount!: number;
}