import { Test } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm/repository/Repository";
import { InternalServerErrorException } from "@nestjs/common";
import { Jwt } from "jsonwebtoken";

describe("UsersService", () => {
    let service: UsersService;

    const mockRepository = () => ({
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        findOneOrFail: jest.fn(),
        update: jest.fn(), 
        delete: jest.fn()
    });

    const mockJwtService = {
        sign: jest.fn((userId: number) => "signed-token"),
        verify: jest.fn(),
    };

    const mockMailService = {
        sendVerificationEmail: jest.fn(),
    };

    type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

    let usersRepository: MockRepository<User>;
    let verificationRepository: MockRepository<Verification>;
    let mailService: MailService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository(),
                },
                {
                    provide: getRepositoryToken(Verification),
                    useValue: mockRepository(),
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: MailService,
                    useValue: mockMailService,
                },
            ],
        }).compile();
        service = module.get<UsersService>(UsersService);
        usersRepository = module.get(getRepositoryToken(User));
        verificationRepository = module.get(getRepositoryToken(Verification));
        mailService = module.get<MailService>(MailService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    const createAccountArgs = {
        email: "email",
        password: "",
        role: 0,
    };

    describe("createAccount", () => {
        it("should fail if user exists", async () => {
            usersRepository.findOne.mockResolvedValue({
                id: 1,
                email: "asdfasdf",
            });

            const result = await service.createAccount(createAccountArgs);

            expect(result).toMatchObject({
                ok: false,
                error: "There is a user with that email already",
            });
        });

        it("should create a new user", async () => {
            usersRepository.findOne.mockResolvedValue(undefined);
            usersRepository.create.mockReturnValue(createAccountArgs);
            usersRepository.save.mockReturnValue(createAccountArgs);
            verificationRepository.create.mockReturnValue({ user: createAccountArgs });
            verificationRepository.save.mockResolvedValue({ user: createAccountArgs, code: "code" });
            const result = await service.createAccount(createAccountArgs);
            expect(usersRepository.create).toHaveBeenCalledTimes(1);
            expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
            expect(verificationRepository.create).toHaveBeenCalledTimes(1);
            expect(verificationRepository.create).toHaveBeenCalledWith({
                user: createAccountArgs,
            });
            expect(verificationRepository.save).toHaveBeenCalledTimes(1);
            expect(verificationRepository.save).toHaveBeenCalledWith({
                user: createAccountArgs,
            });
            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(createAccountArgs.email, "code");
            expect(result).toEqual({ ok: true });
        });

        it("should fail due to exception", async () => {
            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.createAccount(createAccountArgs);
            expect(result).toEqual({ ok: false, error: "Couldn't create account" });
        });
    });

    describe("login", () => {
        const loginArgs = {
            email: "email",
            password: "password",
        };
        it("should fail with exception", async () => {
            usersRepository.findOne.mockRejectedValue(new Error()); 
            const result = await service.login(loginArgs); 
            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: loginArgs.email } });
            expect(result).toEqual({
                ok: false,
                error: new Error()
            })
        })

        it("should fail if user doesn't exist", async () => {
            usersRepository.findOne.mockResolvedValue(null);
            const result = await service.login(loginArgs);
            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: loginArgs.email } });
            expect(result).toEqual({
                ok: false,
                error: "User not found",
            });
        });

        it("should fail if the password is incorrect", async () => {
            const mockUser = {
                email: "email",
                checkPassword: jest.fn(() => Promise.resolve(false)),
            };

            usersRepository.findOne.mockResolvedValue(mockUser);
            const result = await service.login(loginArgs);
            expect(result).toEqual({
                ok: false,
                error: "wrong password",
            });
        });
        it("should return token if password is correct", async () => {
            const mockUser = {
                email: "email",
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(true)),
            };

            usersRepository.findOne.mockResolvedValue(mockUser);
            const result = await service.login(loginArgs);

            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual({ ok: true, token: "signed-token" });
        });
    });

    describe("findById", () => {
        const userProfileArg = { userId: 1 };
        const mockUser = { email: "email" };
        it("should fail if the user cannot be found", async () => {
            usersRepository.findOneOrFail.mockRejectedValue(new Error());
            const result = await service.findById(userProfileArg);
            expect(result).toEqual({
                error: "User Not Found",
                ok: false,
            });
        });

        it("should find a user", async () => {
            usersRepository.findOneOrFail.mockResolvedValue(mockUser);
            const result = await service.findById(userProfileArg);
            expect(result).toEqual({
                user: mockUser,
                ok: true,
            });
        });

        it("should find a user", async () => {
            usersRepository.findOneOrFail.mockResolvedValue(mockUser);
            const result = await service.findById(userProfileArg);
            expect(result).toEqual({
                user: mockUser,
                ok: true,
            });
        });
    });

    describe("editProfile", () => {
        const mockUser = {
            email: "email",
            password: "password",
            verified: true,
        };

        it("should fail with exception", async () => {
            const mockEditProfileInput = {
                userId: 1,
                user: {
                    email: "changed email",
                },
            };

            usersRepository.findOne.mockRejectedValue(new Error());
            const result = await service.editProfile(mockEditProfileInput.userId, mockEditProfileInput.user);
            expect(result).toEqual({
                ok: false,
                error: new Error(),
            });
        });

        it("should change email and send verification email", async () => {
            const mockEditProfileInput = {
                userId: 1,
                user: {
                    email: "changed email",
                },
            };

            usersRepository.findOne.mockResolvedValue(mockUser);
            verificationRepository.create.mockReturnValue({ user: mockUser, code: "code" });
            verificationRepository.save.mockReturnValue({ user: mockUser, code: "code" });
            usersRepository.save.mockResolvedValue(mockUser);

            const result = await service.editProfile(mockEditProfileInput.userId, mockEditProfileInput.user);

            expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
            expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEditProfileInput.userId } });
            expect(verificationRepository.create).toHaveBeenCalledTimes(1);
            expect(verificationRepository.create).toHaveBeenCalledWith({
                user: mockUser,
            });
            expect(verificationRepository.save).toHaveBeenCalledTimes(1);
            expect(verificationRepository.save).toHaveBeenCalledWith({
                user: mockUser,
                code: "code",
            });

            expect(result).toEqual({
                ok: true,
            });
        });

        it("should change password", async () => {
            const mockEditProfileInput = {
                userId: 1,
                user: {
                    password: "changed password",
                },
            };

            usersRepository.findOne.mockResolvedValue({ password: "password" });
            usersRepository.save.mockResolvedValue({ password: "changed password" });

            const result = await service.editProfile(mockEditProfileInput.userId, mockEditProfileInput.user);

            expect(usersRepository.save).toHaveBeenCalledTimes(1);
            expect(usersRepository.save).toHaveBeenCalledWith(mockEditProfileInput.user);
            expect(result).toEqual({
                ok: true,
            });
        });
    });
    describe("verifyEmail", () => {
        const findOneArgs = {
            code: "code"
        }
        const mockVerification = {
            id: 1,
            code: "code",
            user: {
                id: 1,
                verified: false,
            },
        };

        it("should verify email", async () => {
            verificationRepository.findOne.mockResolvedValue(mockVerification);
            const result = await service.verifyEmail(findOneArgs.code);

            expect(verificationRepository.findOne).toHaveBeenCalledTimes(1); 
            expect(verificationRepository.findOne).toHaveBeenCalledWith({
                where: {
                    code: mockVerification.code
                }, 
                relations: {
                    user: true
                }
            }); 

            expect(usersRepository.update).toHaveBeenCalledTimes(1); 
            expect(usersRepository.update).toHaveBeenCalledWith(mockVerification.id, {
                verified: true
            }); 

            expect(verificationRepository.delete).toHaveBeenCalledTimes(1); 
            expect(verificationRepository.delete).toHaveBeenCalledWith(mockVerification.id); 
            expect(result).toEqual({ ok: true }); 
        });

        it("should fail on exception", async () => {
            verificationRepository.findOne.mockRejectedValue(new Error());
            const result = await service.verifyEmail(findOneArgs.code);
            expect(verificationRepository.findOne).toHaveBeenCalledTimes(1); 
            expect(verificationRepository.findOne).toHaveBeenCalledWith({
                where: {
                    code: "code"
                }, 
                relations: {
                    user: true
                }
            }); 
            expect(result).toEqual({
                ok: false,
                error: new Error()
            });
        });

        it("should fail if verification is not found", async () => {
            verificationRepository.findOne.mockResolvedValue(undefined);
            const result = await service.verifyEmail(findOneArgs.code);
            expect(verificationRepository.findOne).toHaveBeenCalledTimes(1); 
            expect(verificationRepository.findOne).toHaveBeenCalledWith({
                where: {
                    code: "code"
                }, 
                relations: {
                    user: true
                }
            }); 
            expect(result).toEqual({
                ok: false,
                error: "Verification not found.",
            })
        });
    });
});
