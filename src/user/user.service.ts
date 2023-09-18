import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./models/user.model";
import { UserInputDto } from "./dto/userInput.dto";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { UserUpdateInputDto } from "./dto/userUpdateInput.dto";
import { InjectMapper } from "@automapper/nestjs";
import { Mapper } from "@automapper/core";
import { UserOutputDto } from "./dto/userOutput.dto";
import { UserRepository } from "./repository/user.repository";

@Injectable()
export class UserService {
    constructor(private userRepo: UserRepository, @InjectMapper() private readonly classMapper: Mapper, private configService: ConfigService){}

    async findAll(): Promise<UserOutputDto[]> {
        const usersFound =  await this.userRepo.findAll();
        const usersToReturn = this.classMapper.mapArray(usersFound, User, UserOutputDto);
        return usersToReturn;
    }

    async findById(id: string): Promise<UserOutputDto>{
        const userFound = await this.userRepo.findById(id);
        if (!userFound){
            throw new NotFoundException(`user with ${id} not found.`);
        }

        const userToReturn = this.classMapper.map(userFound, User, UserOutputDto);
        return userToReturn;
    }

    async findByEmail(email: string): Promise<UserOutputDto>{
        const userFound = await this.userRepo.findByEmail(email);
        if (!userFound){
            throw new NotFoundException(`user with ${email} not found.`);
        }
        const userToReturn = this.classMapper.map(userFound, User, UserOutputDto);
        return userToReturn;
    }

    async create(user: UserInputDto): Promise<UserOutputDto>{
        await this.findDuplicateUser(user.email);

        const hashedPassword = await this.hashPassword(user.password);
        user.password = hashedPassword;

        const newUser = this.classMapper.map(user, UserInputDto, User);            
        const userCreated =  await this.userRepo.create(newUser);
        const userToReturn = this.classMapper.map(userCreated, User, UserOutputDto);
        return userToReturn;
    }

    async update(id: string, user: UserUpdateInputDto): Promise<UserOutputDto>{
        let userFound = await this.userRepo.findById(id);
        if(!userFound){
            throw new NotFoundException(`user with ${id} not found.`);
        }
        if(user.email !== userFound.email){
            await this.findDuplicateUser(user.email); 
        }
        const update = Object.assign(userFound, user);
        const userUpdated =  await this.userRepo.update(id, update);
        const userToReturn = this.classMapper.map(userUpdated, User, UserOutputDto);

        return userToReturn;
    }

    async delete(id: string): Promise<boolean>{
        const userFound = await this.userRepo.findById(id);
        if(!userFound){
            throw new NotFoundException(`user with ${id} not found.`);
        }

        const res =  await this.userRepo.delete(id);
        return !!res;
    }

    private async findDuplicateUser(email: string): Promise<User>{
        const userFound = await this.userRepo.findByEmail(email);
        if(userFound){
            throw new BadRequestException("Email already exists, use a different one.");
        }

        return userFound;
    }

    private async hashPassword(password: string): Promise<string> {
        const hashSalt = this.configService.get<string>("auth.hashSalt");
        const hash = await bcrypt.hash(password, Number(hashSalt));

        return hash;
    }
}