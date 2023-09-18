import { classes } from "@automapper/classes";
import { AutomapperModule } from "@automapper/nestjs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { User, UserSchema } from "src/user/models/user.model";
import { UserProfile } from "src/user/profile/user.profile";
import { UserRepository } from "src/user/repository/user.repository";
import { UserService } from "src/user/user.service";
import { closeInMongodConnection, rootMongooseTestModule } from "test/data/mongoose.helper";
import { userData } from "test/data/userData.mock";

describe("User Service", () => {
    let userService: UserService;
    let userRepository: UserRepository;
    let userMockData = userData;
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
            providers: [UserService, UserRepository, ConfigService, UserProfile]
        }).compile();

        userService = app.get<UserService>(UserService);
        userRepository = app.get<UserRepository>(UserRepository);
    });

    afterEach(async () => {
        if (app) {
          await app.close();
          await closeInMongodConnection();
        }
    });

    it("user repository should be defined", () => {
        expect(userRepository).toBeDefined();
    });

    it("user service should be defined", () => {
        expect(userService).toBeDefined();
    })

    describe("find all users", () => {
        it("should return all users", async () => {
            jest.spyOn(userRepository, "findAll")
            .mockImplementation(async () => userMockData.read as User[]);

            expect(await userService.findAll()).toEqual(userMockData.read);
        })
    })

    describe("find user by id", () => {
        it("should return found user with valid ID", async () => {
            const id = userMockData.read[0]._id;
            jest.spyOn(userRepository, "findById")
            .mockImplementation(async (id) => userMockData.read[0] as User);

            expect(await userService.findById(id)).toEqual(userMockData.read[0])
        })

        it("should throw not found exception if id does not exist", async () => {
            const id = userMockData.read[0]._id;
            jest.spyOn(userRepository, "findById")
            .mockImplementation(async (id) => null);

            try {
               await userService.findById(id); 
            } catch (error) {
                expect(error.message).toBe(`user with ${id} not found.`);   
            }
        })
    })

    describe("find user by email", () => {
        it("should return found user with valid email", async () => {
            const email = userMockData.read[0].email;
            jest.spyOn(userRepository, "findByEmail")
            .mockImplementation(async (email) => userMockData.read[0] as User);

            expect(await userService.findByEmail(email)).toEqual(userMockData.read[0])
        })

        it("should throw not found exception if email does not exist", async () => {
            const email = userMockData.read[0].email;
            jest.spyOn(userRepository, "findByEmail")
            .mockImplementation(async (email) => null);

            try {
               await userService.findByEmail(email); 
            } catch (error) {
                expect(error.message).toBe(`user with ${email} not found.`);   
            }
        })
    })

    describe("create user", () => {
        it("should return created user", async () => {
            jest.spyOn(userRepository, "findByEmail")
            .mockImplementation(async (email) => null);

            jest.spyOn(userRepository, "create")
            .mockImplementation(async (user) => userMockData.read[0] as User);

            expect(await userService.create(userMockData.create)).toEqual(userMockData.read[0])
        })

        it("should throw bad request exception if email aready exist ", async () => {
            jest.spyOn(userRepository, "findByEmail")
            .mockImplementation(async (email) => userMockData.read[0] as User);

            try {
               await userService.create(userMockData.create); 
            } catch (error) {
                expect(error.message).toBe(`Email already exists, use a different one.`);   
            }
        })
    })

    describe("update user", () => {
        it("should return updated user", async () => {
            jest.spyOn(userRepository, "findByEmail")
            .mockImplementation(async (email) => null);

            jest.spyOn(userRepository, "findById")
            .mockImplementation(async (id) => userMockData.read[1] as User);
            
            jest.spyOn(userRepository, "update")
            .mockImplementation(async (user) => userMockData.read[0] as User);

            expect(await userService.update(userMockData.read[1]._id, userMockData.read[1]))
            .toEqual(userMockData.read[0])
        })

        it("should throw not found exception if ID does not exist", async () => {
            const id = userMockData.read[0]._id;

            jest.spyOn(userRepository, "findById")
            .mockImplementation(async (id) => null);

            try {
               await userService.update(userMockData.read[0]._id, userMockData.read[0]); 
            } catch (error) {
                expect(error.message).toBe(`user with ${id} not found.`);   
            }
        })

        it("should throw bad request exception if email aready exist ", async () => {
            jest.spyOn(userRepository, "findByEmail")
            .mockImplementation(async (email) => userMockData.read[0] as User);

            jest.spyOn(userRepository, "findById")
            .mockImplementation(async (id) => userMockData.read[1] as User);

            try {
               await userService.update(userMockData.read[0]._id, userMockData.read[0]); 
            } catch (error) {
                expect(error.message).toBe(`Email already exists, use a different one.`);   
            }
        })
    })

    describe("delete user", () => {
        it("should return true if user has been deleted", async () => {
            jest.spyOn(userRepository, "findById")
            .mockImplementation(async (id) => userMockData.read[0] as User);

            jest.spyOn(userRepository, "delete")
            .mockImplementation(async (id) => true);

            expect(await userService.delete(userMockData.read[0]._id)).toBe(true)
        })

        it("should throw not found exception if ID does not exist.", async () => {
            const id = userMockData.read[0]._id
            jest.spyOn(userRepository, "findById")
            .mockImplementation(async (id) => null);

            try {
               await userService.delete(id); 
            } catch (error) {
                expect(error.message).toBe(`user with ${id} not found.`);   
            }
        })
    })
});