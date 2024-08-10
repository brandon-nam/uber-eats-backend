import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { DataSource, Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Verification } from "src/users/entities/verification.entity";
import { any } from "joi";

jest.mock("got");

describe("User", () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let userRepository: Repository<User>;
    let verificationRepository: Repository<Verification>;
    let jwtToken: string;

    const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
    const publicTest = (query: string) => baseTest().send({query}); 
    const privateTest = (query: string) => baseTest().set("X-JWT", jwtToken).send({query}); 

    const GRAPHQL_ENDPOINT = "/graphql";
    const EMAIL = "brandonnam2020@gmail.com";
    const PASSWORD = 12345;
    const NEW_EMAIL = "NEW_EMAIL";
    const NEW_PASSWORD = 12345;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        verificationRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification));
        dataSource = module.get(DataSource);
        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        const dataSource = new DataSource({
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "brandonnam",
            password: "1234",
            database: "uber-eats-test",
        });
        const connection = await dataSource.initialize();
        await connection.dropDatabase();
        await connection.destroy();

        await app.close();
    });

    describe("createAccount", () => {
        it("should create account", () => {
            return publicTest(`
          mutation {
            createAccount(input: {
              email:"${EMAIL}",
              password:"${PASSWORD}",
              role:Owner
            }) {
              ok
              error
            }
          }
          `)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.createAccount.ok).toBe(true);
                    expect(res.body.data.createAccount.error).toBe(null);
                });
        });

        it("should fail if account already exists", () => {
            return publicTest(`
          mutation {
            createAccount(input: {
              email:"${EMAIL}",
              password:"${PASSWORD}",
              role:Owner
            }) {
              ok
              error
            }
          }
          `)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.createAccount.ok).toBe(false);
                    expect(res.body.data.createAccount.error).toEqual("There is a user with that email already");
                });
        });
    });
    describe("login", () => {
        it("should login with correct credentials", () => {
            return publicTest(`
          mutation {
            login(input: {
              email:"${EMAIL}",
              password:"${PASSWORD}",
            }) {
              ok
              token
              error
            }
          }
          `,
                )
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            data: { login },
                        },
                    } = res;
                    jwtToken = login.token;
                    expect(login.ok).toBe(true);
                    expect(login.token).toEqual(expect.any(String));
                });
        });
        it("should not be able to login with wrong credentials", () => {
            return publicTest(`
            mutation {
              login(input: {
                email:"${EMAIL}",
                password:"xxx",
              }) {
                ok
                token
                error
              }
            }
            `)
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            data: { login },
                        },
                    } = res;
                    expect(login.error).toBe("wrong password");
                    expect(login.ok).toBe(false);
                    expect(login.token).toBe(null);
                });
        });
    });

    describe("userProfile", () => {
        let user: User;
        let userId: number;
        beforeAll(async () => {
            [user] = await userRepository.find();
            userId = user.id;
        });
        it("should see user's profile", () => {
            return privateTest(`
                      query {
                        userProfile(userId: ${userId}) {
                          ok
                          error
                          user {
                            id
                            email
                            password
                          }
                        }
                      }
                    `,
                )
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            data: {
                                userProfile: { ok, error, user },
                            },
                        },
                    } = res;
                    expect(ok).toBeTruthy();
                    expect(error).toBeNull();
                    expect(user.id).toBe(userId);
                });
        });

        it("should not find a profile", () => {
            return privateTest(`
        {
          userProfile(userId:666){
            ok
            error
            user {
              id
            }
          }
        }
        `)
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            data: {
                                userProfile: { ok, error, user },
                            },
                        },
                    } = res;
                    expect(ok).toBe(false);
                    expect(error).toBe("User Not Found");
                    expect(user).toBe(null);
                });
        });
    });

    describe("me", () => {
        it("should return my profile", () => {
            return privateTest(`
              query {
                me {
                  email              
                }
              }
            `,
                )
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            data: {
                                me: { email, id },
                            },
                        },
                    } = res;
                    expect(email).toBe(EMAIL);
                });
        });

        it("should not allow logged out user", () => {
            return publicTest(`
                query {
                  me {
                    email
                  }
                }
              `)
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            errors: [error],
                        },
                    } = res;

                    expect(error.message).toBe("Forbidden resource");
                });
        });
    });

    describe("editProfile", () => {
        it("should edit profile", () => {
            return privateTest(`
                        mutation {
                          editProfile(input: {
                            email: "${NEW_EMAIL}", 
                            password: "${NEW_PASSWORD}"
                          }) {
                            ok 
                            error
                          }
                        }
                      `,
                )
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            data: {
                                editProfile: { ok, error },
                            },
                        },
                    } = res;

                    expect(ok).toBeTruthy();
                    expect(error).toBeNull();
                });
        });

        it("should return new email when query me", () => {
            return privateTest(`
                        query {
                          me {
                            email
                          }
                        }
                    `
                )
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            data: {
                                me: { email },
                            },
                        },
                    } = res;

                    expect(email).toBe(NEW_EMAIL);
                });
        });
    });

    describe("verifyEmail", () => {
        let code: string;
        beforeAll(async () => {
            const verification = await verificationRepository.findOne({ where: { user: { email: NEW_EMAIL } } });
            code = verification.code;
        });

        it("should change verified value of a user to true", () => {
            return privateTest(`
                      mutation {
                        verifyEmail(input: {
                          code: "${code}"
                        }) {
                          ok 
                          error
                        }
                      }
                    `
                )
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            data: {
                                verifyEmail: { ok, error },
                            },
                        },
                    } = res;

                    expect(ok).toBeTruthy();
                    expect(error).toBeNull();
                });
        });
        it("should fail on verification code not found", () => {
          return privateTest(`
                      mutation {
                        verifyEmail(input: {
                          code: "randomcode"
                        }) {
                          ok 
                          error
                        }
                      }
                    `
                )
                .expect(200)
                .expect((res) => {
                    const {
                        body: {
                            data: {
                                verifyEmail: { ok, error },
                            },
                        },
                    } = res;
                    expect(ok).toBeFalsy();
                    expect(error).toEqual("Verification not found.");
                });
        });
    });
});
