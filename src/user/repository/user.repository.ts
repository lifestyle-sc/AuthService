import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../models/user.model";
import { Model } from "mongoose";

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}

    async findById(id: string): Promise<User>{
        return await this.userModel.findById(id);
    }

    async findByEmail(email: string): Promise<User>{
        return await this.userModel.findOne({ email });
    }

    async findAll(): Promise<User[]>{
        return await this.userModel.find();
    }

    async create(user: User): Promise<User>{
        const newUser = new this.userModel(user);

        return await newUser.save();
    }

    async update(id: string, user: User): Promise<User>{
        return await this.userModel.findByIdAndUpdate(id, user, { new: true });
    }

    async delete(id: string): Promise<boolean>{
        return await this.userModel.findByIdAndDelete(id);
    }
}