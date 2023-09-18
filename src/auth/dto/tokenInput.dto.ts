import { Field, InputType, PartialType } from "@nestjs/graphql";
import { TokenDto } from "./token.dto";

@InputType()
export class TokenInputDto {
    @Field()
    accessToken: string;

    @Field()
    refreshToken: string;
}