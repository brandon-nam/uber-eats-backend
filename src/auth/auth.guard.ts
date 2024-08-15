import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { AllowedRoles } from "./auth-role.decorator";
import { JwtService } from "src/jwt/jwt.service";
import { UsersService } from "src/users/users.service";
import { TOKEN_KEY_WS } from "src/common/common.constants";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext) {
        const role = this.reflector.get<AllowedRoles>("roles", context.getHandler());

        if (!role) {
            return true;
        }

        const gqlContext = GqlExecutionContext.create(context).getContext();
        if (gqlContext.token) {
            const token = gqlContext.token;
            const decoded = this.jwtService.verify(token.toString());
            if (typeof decoded === "object" && decoded.hasOwnProperty("id")) {
                try {
                    const { ok, user } = await this.usersService.findById({ userId: decoded["id"] });
                    if (ok) {
                        
                        gqlContext["user"] = user;
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            
            if (!gqlContext["user"]) {
                return false;
            }
            
            if (role.includes("Any")) {
                return true;
            }
            
            return role.includes(gqlContext["user"].role);
        }
    }
}
