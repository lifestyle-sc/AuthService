import { AutoMap } from "@automapper/classes";
import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, MaxLength } from "class-validator";

@InputType()
export class UserInputDto {
    @MaxLength(30)
    @Field()
    @AutoMap()
    firstName: string;

    @MaxLength(30)
    @Field()
    @AutoMap()
    lastName: string;

    @IsEmail()
    @Field()
    @AutoMap()
    email: string;

    @Field()
    @AutoMap()
    password: string;

    @Field({nullable: true})
    @AutoMap()
    phoneNo?: string;
}