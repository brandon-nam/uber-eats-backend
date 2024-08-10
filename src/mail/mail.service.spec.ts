import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import got from "got";
import * as FormData from "form-data";
import { MailService } from "./mail.service";

jest.mock("form-data");

jest.mock("got");

describe("MailService", () => {
    let mailService: MailService;
    const TEST_DOMAIN = "test-domain";

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: CONFIG_OPTIONS,
                    useValue: {
                        apiKey: "test-apiKey",
                        domain: TEST_DOMAIN,
                        fromEmail: "test-fromEmail",
                    },
                },
            ],
        }).compile();
        mailService = module.get(MailService);
    });

    it("should be defined", () => {
        expect(mailService).toBeDefined();
    });

    describe("sendVerificationEmail", () => {
        const args = {
            email: "email",
            code: "code",
        };

        it("should send verification email", () => {
            jest.spyOn(mailService, "sendEmail").mockImplementation(async () => true);
            mailService.sendVerificationEmail(args.email, args.code);

            expect(mailService.sendEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendEmail).toHaveBeenCalledWith(
                "brandonnam2020@gmail.com",
                "Verify Your Email",
                "uber-eats-verify",
                [
                    { key: "code", value: args.code },
                    { key: "username", value: args.email },
                ]
            );
        });
    });

    describe("sendEmail", () => {
        it("should send email", async () => {
            const ok = await mailService.sendEmail("", "", "", [{ key: 'attr', value: 'attrValue' }]);
            const appendSpy = jest.spyOn(FormData.prototype, "append");
            expect(appendSpy).toHaveBeenCalled();
            expect(appendSpy).toHaveBeenCalledTimes(5);
            expect(got.post).toHaveBeenCalledTimes(1);
            expect(got.post).toHaveBeenCalledWith(`https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`, expect.any(Object));
            expect(ok).toBeTruthy();
        });

        it("fails on error", async () => {
            jest.spyOn(got, "post").mockImplementation(() => {
                throw new Error();
            });
            const ok = await mailService.sendEmail("", "", "", []);
            expect(ok).toBeFalsy();
        });
    });
});
