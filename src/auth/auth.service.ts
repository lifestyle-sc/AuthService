import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { LoginInputDto } from "./dto/loginInput.dto";
import { User } from "src/user/models/user.model";
import { TokenDto } from "./dto/token.dto";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { ConfigService } from "@nestjs/config";
import { TokenInputDto } from "./dto/tokenInput.dto";
import { UserRepository } from "src/user/repository/user.repository";

@Injectable()
export class AuthService {
    constructor(private userRepo: UserRepository, private readonly jwtService: JwtService, private configService: ConfigService) {}

    async validateUser(user: LoginInputDto): Promise<User>{
        const userFound: User = await this.findByEmail(user.email);
        const isMatch = await bcrypt.compare(user.password, userFound.password);
        if(!isMatch){
            throw new UnauthorizedException("Password provided is invalid");
        }

        return userFound; 
    }

    async createToken(user: User, populateExp: boolean): Promise<TokenDto>{
        const refreshToken = this.generateRefreshToken();

        user.refreshToken = refreshToken;
        if(populateExp){
            const today = new Date()
            today.setDate(today.getDate() + 7)
            user.refreskTokenExpiryTime = today;
        }

        this.userRepo.update(user._id, user);

        const payload = { sub: user._id, email: user.email}
        const response = new TokenDto();
        response.accessToken = await this.jwtService.signAsync(payload);
        response.refreshToken = refreshToken;
        return response;
    }

    async refreshToken(tokens: TokenInputDto): Promise<TokenDto>{
        const payload = await this.verifyAccessToken(tokens.accessToken);
        const userFound = await this.userRepo.findByEmail(payload.email);
        const today = new Date();
        if(userFound === null || userFound.refreshToken !== tokens.refreshToken || userFound.refreskTokenExpiryTime.getTime() <= today.getTime()){
            throw new UnauthorizedException("Invalid client request. This tokens has some invalid values");
        }

        return await this.createToken(userFound, false);
    }

    async logout(id: string): Promise<string>{
        const userFound = await this.userRepo.findById(id);
        if (!userFound){
            throw new NotFoundException(`user with ${id} not found.`);
        }
        userFound.refreshToken = null;
        userFound.refreskTokenExpiryTime = null;

        await this.userRepo.update(id, userFound);

        return "Logged Out Successfully";
    }

    private async findByEmail(email: string): Promise<User>{
        const userFound: User = await this.userRepo.findByEmail(email);
        if (!userFound){
            throw new NotFoundException(`user with ${email} not found.`);
        }

        return userFound;
    }

    private async verifyAccessToken(accessToken: string){
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(accessToken,{
                secret: this.configService.get<string>("auth.secretKey"),
                ignoreExpiration: true
            });
        } catch {
            throw new UnauthorizedException("Invalid Access Token");
        }

        return payload;
    }

    private generateRefreshToken(): string{
        const randomBytesArray = randomBytes(32);
        let result = "";
        for(let i = 0; i < randomBytesArray.length; i++){
            result += String.fromCharCode(randomBytesArray[i]);
        }
        const refreshToken = btoa(result);

        return refreshToken;
    }
}