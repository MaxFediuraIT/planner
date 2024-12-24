import { IsOptional, Min, IsNumber, Max, IsEmail, IsString, MinLength } from "class-validator";



export class PomadoroSettingsDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    workInterval?: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    breakInterval?: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    intervalsCount?: number
}

export class UserDto extends PomadoroSettingsDto {
    @IsOptional()
    @IsEmail()
    email?: string

    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @IsString()
    password?: string
}
