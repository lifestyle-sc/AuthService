import { AutoMap } from "@automapper/classes";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEmail, MaxLength } from "class-validator";
import { Document } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = User & Document;

@ObjectType()
@Schema()
export class User {
    @Field(type => ID)
    @AutoMap()
    @Prop({ type: String, default: () => (uuidv4())})
    _id: string;

    @MaxLength(30)
    @Field()
    @AutoMap()
    @Prop({ required: true })
    firstName: string;

    @MaxLength(30)
    @Field()
    @AutoMap()
    @Prop({ required: true })
    lastName: string;

    @IsEmail()
    @Field()
    @AutoMap()
    @Prop({ required: true, unique: true })
    email: string;

    @Field()
    @AutoMap()
    @Prop({ required: true })
    password: string;

    @Field({nullable: true}) 
    @AutoMap()
    @Prop()
    phoneNo?: string;

    @AutoMap()
    @Prop()
    refreshToken: string;

    @AutoMap()
    @Prop()
    refreskTokenExpiryTime: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);