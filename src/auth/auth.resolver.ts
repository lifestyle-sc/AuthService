import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginInputDto } from "./dto/loginInput.dto";
import { TokenDto } from "./dto/token.dto";
import { TokenInputDto } from "./dto/tokenInput.dto";
import { AuthGuard } from "./auth.guard";
import { UserInputDto } from "src/user/dto/userInput.dto";
import { UserOutputDto } from "src/user/dto/userOutput.dto";
import { UserService } from "src/user/user.service";

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService, private userService: UserService){}

    @Mutation(returns => UserOutputDto)
    async register(@Args("user") user: UserInputDto): Promise<UserOutputDto>{
        return await this.userService.create(user);
    }

    @Mutation(returns => TokenDto)
    async signIn(@Args("user")user: LoginInputDto): Promise<TokenDto>{
        const userFound = await this.authService.validateUser(user);

        return await this.authService.createToken(userFound, true);
    }

    @Mutation(returns => TokenDto)
    async refreshToken(@Args("token")tokens: TokenInputDto): Promise<TokenDto>{
        return await this.authService.refreshToken(tokens);
    }

    @Mutation(returns => String)
    @UseGuards(AuthGuard)
    async logout(@Args("id") id: string): Promise<string>{
        return await this.authService.logout(id);
    }
}