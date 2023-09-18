import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { UserProfile } from './profile/user.profile';
import { UserRepository } from './repository/user.repository';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
    ],
    providers: [UserResolver, UserService, UserProfile, UserRepository],
    exports: [UserService, UserRepository]
})
export class UserModule {}
