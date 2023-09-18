import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private configService: ConfigService, private jwtService: JwtService){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const gqlExecutionContext = GqlExecutionContext.create(context);
        const ctx = gqlExecutionContext.getContext();
        if(!ctx.headers.authorization){
            return false;
        }
        const token = this.extractTokenFromHeader(ctx.headers.authorization);
        if(!token){
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('auth.secretKey')
            })

            ctx.users = payload;
        } catch{
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(authorization: string): string | undefined {
        const [ type, token ] = authorization?.split(' ') ?? [];

        return type === 'Bearer' ? token : undefined;
    }
}