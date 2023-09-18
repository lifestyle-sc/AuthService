import { Field, InputType, PartialType } from "@nestjs/graphql";
import { UserInputDto } from "./userInput.dto";
import { AutoMap } from "@automapper/classes";

@InputType()
export class UserUpdateInputDto extends PartialType(UserInputDto) {
    @Field()
    @AutoMap()
    _id: string;
}