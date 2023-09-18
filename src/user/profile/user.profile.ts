import { Mapper, createMap, forMember, ignore } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { User } from "../models/user.model";
import { UserOutputDto } from "../dto/userOutput.dto";
import { UserInputDto } from "../dto/userInput.dto";
import { UserUpdateInputDto } from "../dto/userUpdateInput.dto";

@Injectable()
export class UserProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper){
        super(mapper)
    }

    override get profile() {
        return (mapper) => {
            createMap(mapper, User, UserOutputDto);
            createMap(mapper, UserInputDto, User, forMember((dest) => dest._id, ignore()));
            createMap(mapper, UserUpdateInputDto, User);
        };
    }
}