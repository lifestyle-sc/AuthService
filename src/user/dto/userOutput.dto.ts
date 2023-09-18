import { AutoMap } from "@automapper/classes";
import { Field, ObjectType } from "@nestjs/graphql";
import { IsEmail, MaxLength } from "class-validator";

@ObjectType()
export class UserOutputDto {
    @Field()
    @AutoMap()
    _id: string;
    
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

    @Field({nullable: true})
    @AutoMap()
    phoneNo?: string;
}