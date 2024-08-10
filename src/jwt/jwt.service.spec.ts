import { Test } from "@nestjs/testing";
import { JwtService } from "./jwt.service";
import * as jwt from "jsonwebtoken";
import { CONFIG_OPTIONS } from "src/common/common.constants";

const USER_ID = 1;
const PRIVATE_KEY = "privateKey";

jest.mock("jsonwebtoken", () => {
    return {
        sign: jest.fn(() => "TOKEN"),
        verify: jest.fn(() => ({ id: USER_ID })),
    };
});

describe("JwtService", () => {
    let jwtSevice: JwtService;
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtService,
                {
                    provide: CONFIG_OPTIONS,
                    useValue: { privateKey: PRIVATE_KEY },
                },
            ],
        }).compile();

        jwtSevice = module.get<JwtService>(JwtService);
    });

    it("should be defined", () => {
        expect(jwtSevice).toBeDefined();
    });

    describe("sign", () => {
        it("should return a token", () => {
            const token = jwtSevice.sign(USER_ID);
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    id: USER_ID,
                },
                PRIVATE_KEY
            );
            expect(typeof token).toBe("string");
        });
    });

    describe("verify", () => {
        it("should verify a token", () => {
            const TOKEN = "TOKEN";
            
            const decoded = jwtSevice.verify(TOKEN);
            
            expect(jwt.verify).toHaveBeenCalledTimes(1);
            expect(jwt.verify).toHaveBeenCalledWith(TOKEN, PRIVATE_KEY);
            expect(decoded).toEqual({ id: USER_ID });
        });
    });
});
