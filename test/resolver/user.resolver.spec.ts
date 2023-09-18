import { classes } from "@automapper/classes";
import { AutomapperModule } from "@automapper/nestjs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { User, UserSchema } from "src/user/models/user.model";
import { UserRepository } from "src/user/repository/user.repository";
import { UserResolver } from "src/user/user.resolver";
import { UserService } from "src/user/user.service";
import { closeInMongodConnection, rootMongooseTestModule } from "test/data/mongoose.helper";
import { userData } from "test/data/userData.mock";

describe("UserResolver", () => {
    let userResolver: UserResolver;
    let userService: UserService;
    let userDataMock = userData;
    let app: TestingModule;

    beforeEach(async () => {
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
            providers: [UserResolver, UserService, UserRepository, ConfigService]
        }).compile();

        userResolver = app.get<UserResolver>(UserResolver);
        userService = app.get<UserService>(UserService);
    })

    afterEach(async () => {
        if (app) {
          await app.close();
          await closeInMongodConnection();
        }
      });

    it("user resolver should be defined", () => {
        expect(userResolver).toBeDefined();
    });

    it("user service should be defined", () => {
        expect(userService).toBeDefined();
    })

    describe("get users", () => {
        it("should return all users", async () => {
            jest.spyOn(userService, "findAll").mockImplementation(async () => userDataMock.read);

            expect(await userResolver.getUsers()).toBe(userDataMock.read);
        })
    });

    describe("get user", () => {
        it("should return with corresponding id", async () => {
            const id = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
            jest.spyOn(userService, "findById").mockImplementation(async (id) => userDataMock.read[0]);

            expect(await userResolver.getUser(id)).toBe(userDataMock.read[0]);
        })
    })

    describe("create user", () => {
        it("should return the created user", async () => {
            jest.spyOn(userService, "create")
            .mockImplementation(async (user) => userDataMock.read[0]);

            expect(await userResolver.postUser(userDataMock.create)).toBe(userDataMock.read[0]);
        })
    })

    describe("update user", () => {
        it("should return the updated user", async () => {
            jest.spyOn(userService, "update")
            .mockImplementation(async (id, user) => userDataMock.read[0]);

            expect(await userResolver.updateUser(userDataMock.read[1])).toBe(userDataMock.read[0]);
        })
    })

    describe("delete user", () => {
        it("should return true if user is deleted", async () => {
            const id = userDataMock.read[0]._id;

            jest.spyOn(userService, "delete")
            .mockImplementation(async (id) => true);

            expect(await userResolver.deleteUser(id)).toBe(true);
        })
    })
});