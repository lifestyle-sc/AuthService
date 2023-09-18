import { classes } from "@automapper/classes";
import { AutomapperModule } from "@automapper/nestjs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthResolver } from "src/auth/auth.resolver";
import { AuthService } from "src/auth/auth.service";
import { User, UserSchema } from "src/user/models/user.model";
import { UserProfile } from "src/user/profile/user.profile";
import { UserRepository } from "src/user/repository/user.repository";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { closeInMongodConnection, rootMongooseTestModule } from "test/data/mongoose.helper";
import { userData } from "test/data/userData.mock";

describe("Auth Resolver", () => {
    let authResolver: AuthResolver;
    let authService: AuthService;
    let userService: UserService;
    let app: TestingModule;
    beforeEach( async () => {
        app = await Test.createTestingModule({
            imports: [
                AutomapperModule.forRoot({
                    strategyInitializer: classes()
                }),
                rootMongooseTestModule(),
                MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
                ConfigModule.forRoot(),
                JwtModule.register({})
            ],
            providers: [AuthResolver, AuthService, ConfigService, UserService, UserRepository, UserProfile],
        }).compile();

        authResolver = app.get<AuthResolver>(AuthResolver);
        authService = app.get<AuthService>(AuthService);
        userService = app.get<UserService>(UserService);
    })

    afterEach(async () => {
        if(app){
            await app.close();
            await closeInMongodConnection();
        }
    })

    it("auth resolver should be defined", () => {
        expect(authResolver).toBeDefined();
    })

    it("auth service should be defined", () => {
        expect(authService).toBeDefined();
    })

    it("user service should be defined", () => {
        expect(userService).toBeDefined();
    })

    describe("register user", () => {
        it("should return registered user", async () => {
            jest.spyOn(userService, "create")
            .mockImplementation(async (user) => userData.read[0]);

            expect(await authResolver.register(userData.create)).toBe(userData.read[0]);
        })
    })

    describe("login user", () => {
        it("should return both access and refresh token", async () => {
            jest.spyOn(authService, "createToken")
            .mockImplementation(async (user, populateExp) => userData.token[0]);

            jest.spyOn(authService, "validateUser")
            .mockImplementation(async (loginDetails) => userData.read[0] as User);

            expect(await authResolver.signIn(userData.login)).toBe(userData.token[0]);
        })
    })

    describe("refresh token", () => {
        it("should return both a new refresh and access token", async () => {
            jest.spyOn(authService, "refreshToken")
            .mockImplementation(async (tokens) => userData.token[1]);

            expect(await authResolver.refreshToken(userData.token[0])).toBe(userData.token[1]);
        })
    })

    describe("log out", () => {
        it("should return the log out message", async () => {
            const id = userData.read[0]._id;
            jest.spyOn(authService, "logout")
            .mockImplementation(async (id) => "Logged Out Successfully");

            expect(await authResolver.logout(id)).toBe("Logged Out Successfully");
        })
    })
});