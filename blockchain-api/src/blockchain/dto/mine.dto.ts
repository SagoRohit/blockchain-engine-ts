import { IsString } from "class-validator";
export class MineDto {
    @IsString()
    minerAddress!: string;
}