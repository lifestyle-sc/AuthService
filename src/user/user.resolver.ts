import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "./models/user.model";
import { UserInputDto } from "./dto/userInput.dto";
import { UserService } from "./user.service";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { UserUpdateInputDto } from "./dto/userUpdateInput.dto";
import { UserOutputDto } from "./dto/userOutput.dto";

@UseGuards(AuthGuard)
@Resolver(of => User)
export class UserResolver {
    constructor(private readonly userService: UserService){}

    @Query(returns => [UserOutputDto])
    async getUsers(): Promise<UserOutputDto[]> {
        return await this.userService.findAll();
    }

    @Query(returns => UserOutputDto)
    async getUser(@Args('id') id: string): Promise<UserOutputDto> {
        return await this.userService.findById(id);
    }

    @Mutation(returns => UserOutputDto)
    async postUser(@Args('user') user: UserInputDto): Promise<UserOutputDto> {
        return await this.userService.create(user);
    }

    @Mutation(returns => UserOutputDto)
    async updateUser(@Args('user') user: UserUpdateInputDto): Promise<UserOutputDto> {
        return await this.userService.update(user._id, user);
    }

    @Mutation(returns => Boolean)
    async deleteUser(@Args("id") id: string): Promise<boolean> {
        return await this.userService.delete(id);
    }
}