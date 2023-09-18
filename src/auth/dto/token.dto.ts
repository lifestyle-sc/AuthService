import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TokenDto {
    @Field()
    accessToken: string;

    @Field()
    refreshToken: string;
}