import { classes } from "@automapper/classes";
import { AutomapperModule } from "@automapper/nestjs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "src/auth/auth.service";
import { config } from "src/config/config";
import { User, UserSchema } from "src/user/models/user.model";
import { UserRepository } from "src/user/repository/user.repository";
import { closeInMongodConnection, rootMongooseTestModule } from "test/data/mongoose.helper";
import * as bcrypt from "bcrypt";
import { userData } from "test/data/userData.mock";

describe("Auth Resolver", () => {
    let authService: AuthService;
    let userRepository: UserRepository;
    let jwtService: JwtService;
    let app: TestingModule;
    beforeEach( async () => {
        app = await Test.createTestingModule({
            imports: [
                AutomapperModule.forRoot({
                    strategyInitializer: classes()
                }),
                rootMongooseTestModule(),
                MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
                ConfigModule.forRoot({
                    load: [config]
                }),
                JwtModule.register({})
            ],
            providers: [AuthService, ConfigService, UserRepository],
        }).compile();

        authService = app.get<AuthService>(AuthService);
        userRepository = app.get<UserRepository>(UserRepository);
        jwtService = app.get<JwtService>(JwtService);
    })

    afterEach(async () => {
        if(app){
            await app.close();
            await closeInMongodConnection();
        }
    })

    it("auth service should be defined", () => {
        expect(authService).toBeDefined();
    })

    it("user service should be defined", () => {
        expect(userRepository).toBeDefined();
    })

    it("jwt service should be defined", () => {
        expect(jwtService).toBeDefined();
    })

    describe("validate user", () => {
        it("should return user found if details is valid", async () => {
            jest.spyOn(userRepository, "findByEmail")
            .mockImplementation(async (email) => userData.read[0] as User);

            jest.spyOn(bcrypt, "compare")
            .mockImplementation(async (password, hashedPassword) => true);

            expect(await authService.validateUser(userData.login)).toEqual(userData.read[0]);
        })

        it("should return user not found error if user does not exist", async () => {
            jest.spyOn(userRepository, "findByEmail")
            .mockImplementation(async (email) => null)

            try {
                await authService.validateUser(userData.login)
            } catch (error) {
                expect(error.message).toBe(`user with ${userData.login.email} not found.`)
            }
        })

        it("should return password is incorrect if password details is invalid", async () => {
            jest.spyOn(userRepository, "findByEmail")
            .mockImplementation(async (email) => userData.read[0] as User);

            jest.spyOn(bcrypt, "compare")
            .mockImplementation(async (password, hashedPassword) => false);

            try {
                await authService.validateUser(userData.login)
            } catch (error) {
                expect(error.message).toBe(`Password provided is invalid`);
            }
        })
    })

    describe("log out user", () => {
        it("should return log out message", async () => {
            const id = userData.read[0]._id;
            jest.spyOn(userRepository, "findById")
            .mockImplementation(async (id) => userData.read[0] as User);

            jest.spyOn(userRepository, "update")
            .mockImplementation(async (id, newUser) => userData.read[0] as User);

            expect(await authService.logout(id)).toBe("Logged Out Successfully")
        })

        it("should return user not found error if user does not exist", async () => {
            const id = userData.read[0]._id;
            jest.spyOn(userRepository, "findById")
            .mockImplementation(async (id) => null);

            try {
                await authService.logout(id);
            } catch (error) {
                expect(error.message).toBe(`user with ${id} not found.`);
            }
        })
    })
});