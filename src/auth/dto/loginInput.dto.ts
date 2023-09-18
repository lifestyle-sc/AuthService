import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, MinLength } from "class-validator";

@InputType()
export class LoginInputDto {
    @IsEmail()
    @Field()
    email: string;

    @MinLength(6)
    @Field()
    password: string;
}