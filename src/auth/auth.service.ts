/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import { verify } from 'argon2';
import { Response } from 'express';

@Injectable()
export class AuthService {
    EXPRIRE_DAY_REFRESH_TOKEN = 1;
    REFRESH_TOKEN_NAME = 'refreshToken';


    constructor(
        private jwt: JwtService,
        private userService: UserService
    ) {}
    
    async login(dto: AuthDto) {
        
        const { password, ...user } = await this.validateUser(dto);
        const tokens =  this.issueTokens(user.id);

        return {
            user,
            ...tokens
        }
    }
    async register(dto: AuthDto) {
        const isExist = await this.userService.getByEmail(dto.email);
        if (isExist) {
            throw new BadRequestException('User already exists');
        }
        const { password, ...user } = await this.userService.create(dto);
        const tokens = this.issueTokens(dto.email);
        

        return {
            user,
            ...tokens
        }
    }

    private issueTokens(userId: string) {
        const data = { id: userId };
        const accessToken = this.jwt.sign(data, {
            expiresIn: '1h'
        });

        const refreshToken = this.jwt.sign(data, {
            expiresIn: '7d'
        })
        return { accessToken, refreshToken };
    }

    private async validateUser(dto: AuthDto) {
        const user = await this.userService.getByEmail(dto.email);

        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isValid = await verify(user.password, dto.password);

        if (!isValid) {
            throw new UnauthorizedException('Invalid password');
        }
        return user;

    }

    addRefreshTokenToResponse(res: Response, refreshToken: string) {
        const expiresIn = new Date()
        expiresIn.setDate(expiresIn.getDate() + this.EXPRIRE_DAY_REFRESH_TOKEN)

        res.cookie(this.REFRESH_TOKEN_NAME,refreshToken,{
            httpOnly: true,
            domain: 'localhost', /*TODO: взяти з конфігурації*/
            expires: expiresIn,
            secure: true,
            sameSite: 'none'  /*lux if production*/
        })
    }

    removeRefreshTokenFromResponse(res: Response) {
        res.cookie(this.REFRESH_TOKEN_NAME, '', {
            httpOnly: true,
            domain: 'localhost', /*TODO: взяти з конфігурації*/
            expires: new Date(0),
            secure: true,
            sameSite: 'none'  /*lux if production*/
        })
    }

    async getNewTokens(refreshToken: string) {
        const result = await this.jwt.verifyAsync(refreshToken);
        console.log(result);
        if (!result) throw new UnauthorizedException('Invalid refreshToken token');

        const user = await this.userService.getByEmail(result.id);
        const tokens = this.issueTokens(user.id);
        return { user, ...tokens };
    } 
}