import { Priority } from "@prisma/client";
import { IsOptional , IsString, IsEnum, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";



export class TaskDto {

    @IsOptional()
    @IsString()
    name: string

    @IsOptional()
    @IsBoolean()
    isCompleted?:boolean

    @IsOptional()
    @IsString()
    createdAt?: string
    
    @IsOptional()
    @IsEnum(Priority)
    @Transform(({ value }) => ('' + value).toLowerCase())
    priority?: Priority
}
