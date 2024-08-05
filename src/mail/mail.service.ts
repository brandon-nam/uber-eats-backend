import { Global, Inject, Injectable } from "@nestjs/common";
import * as FormData from "form-data";
import { CONFIG_OPTIONS } from "../common/common.constants";
import { EmailVar, MailModuleOptions } from "./mail.interfaces";
import got from "got";

@Injectable()
export class MailService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions) {
        
    }

    private async sendEmail(to: string, subject: string, template: string, emailVars: EmailVar[]) {
        const form = new FormData();
        form.append("from", `Dohyun from Uber Eats Clone <mailgun@${this.options.domain}>`);
        form.append("to", to);
        form.append("subject", subject);
        form.append("template", template);
        emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
        try {
            got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
                headers: {
                    Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString("base64")}`,
                },
                method: "POST",
                body: form,
            });
        } catch (e) {
            console.log(e);
        }
    }

    sendVerificationEmail(email: string, code: string) {
        this.sendEmail("brandonnam2020@gmail.com", "Verify Your Email", "uber-eats-verify", [
            { key: "code", value: code },
            { key: "username", value: email },
        ]);
    }
}
