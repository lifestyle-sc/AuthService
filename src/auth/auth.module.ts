import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        UserModule,
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('auth.secretKey'),
                signOptions: { expiresIn: configService.get<string>('auth.accessTokenDuration') }
            }),
            inject: [ConfigService],
        }) 
    ],
    providers: [AuthService, AuthResolver]
})
export class AuthModule {}
